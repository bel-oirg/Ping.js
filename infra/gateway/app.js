'use strict'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import apmPlugin from './plugins/apm.js'
import corePlugin from './plugins/core.js'
import { notifyUser } from './utils/notificationService.js'
import { getOnlineUsers } from './utils/socketManager.js'
import { createOnlineUsersService } from './utils/onlineUsersService.js'
import kafkaConsumerPlugin from './plugins/kafka-consumer.js'
import postgresPlugin from './plugins/postgres.js'
import redisPlugin from './plugins/redis.js'
import socketPlugin from './plugins/socket.js'
import kafkaPlugin from './plugins/kafka.js'
import userServicePlugin from './plugins/user-service.js'
import { cleanupRedisData } from './utils/redisCleanup.js'
import client from 'prom-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isProduction = process.env.NODE_ENV === 'production'

const requestCounter = new client.Counter({
  name: 'gateway_http_requests_total',
  help: 'Total number of HTTP requests handled by the gateway',
  labelNames: ['method', 'route', 'status_code']
})

const registeredUsersGauge = new client.Gauge({
  name: 'gateway_registered_users_total',
  help: 'Total number of registered users'
})

const onlineUsersGauge = new client.Gauge({
  name: 'gateway_online_users_total',
  help: 'Current number of online users'
})

export async function createApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      transport: isProduction ? undefined : {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname,level,time',
          messageFormat: '{msg}',
          singleLine: true
        }
      }
    },
    disableRequestLogging: isProduction,
    trustProxy: true,
    bodyLimit: 5000000,
    connectionTimeout: isProduction ? 30000 : 0
  })  
  
  app.decorate('notifyUser', async (userId, type, data) => {
    return await notifyUser(app, userId, type, data)
  })
  app.decorate('getOnlineUsers', async () => {
    return await getOnlineUsers(app.redis)
  })
  
  if (!isProduction) {
    app.get('/debug/online-users', async (request, reply) => {
      const onlineUsersService = createOnlineUsersService(app.redis)
      const debug = await onlineUsersService.debugOnlineUsers()
      return reply.send(debug)
    })
  }
  
  await app.register(apmPlugin)
  await app.register(corePlugin)
  await app.register(postgresPlugin)
  await app.register(redisPlugin)
  
  const shouldCleanupRedis = process.env.REDIS_CLEANUP_ON_START !== 'false'
  if (shouldCleanupRedis) {
    try {
      const cleanupResult = await cleanupRedisData(app.redis)
      if (cleanupResult.success) {
        app.log.info(`Redis cleanup successful: cleaned ${cleanupResult.cleaned.sockets} sockets, ${cleanupResult.cleaned.users} users`)
      } else {
        app.log.error(`Redis cleanup failed: ${cleanupResult.error}`)
      }
    } catch (error) {
      app.log.error(`Redis cleanup error: ${error.message}`)
    }
  } else {
    app.log.info('Redis cleanup skipped (REDIS_CLEANUP_ON_START=false)')
  }
  
  await app.register(userServicePlugin)
  await app.register(kafkaPlugin)
  await app.register(kafkaConsumerPlugin)
  await app.register(socketPlugin)
  
  app.setNotFoundHandler((request, reply) => {
    const statusCode = 404
    reply.code(statusCode).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode
    })
  })
  
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error)    
    const statusCode = error.statusCode || 500
    const errorResponse = {
      error: error.name || 'Internal Server Error',
      message: isProduction ? 'An unexpected error occurred' : (error.message || 'An unexpected error occurred'),
      statusCode
    }
    
    if (!isProduction && error.stack) {
      errorResponse.stack = error.stack
    }
    
    reply.code(statusCode).send(errorResponse)
  })

  app.addHook('onResponse', async (request, reply) => {
    requestCounter.inc({
      method: request.method,
      route: request.routerPath || request.url,
      status_code: reply.statusCode
    })
  })

  app.get('/metrics', async (request, reply) => {
    // Update registered users gauge
    if (app.userService && app.userService.fastify && app.userService.fastify.pg) {
      try {
        const result = await app.userService.fastify.pg.query('SELECT COUNT(*) FROM users')
        registeredUsersGauge.set(Number(result.rows[0].count))
      } catch {}
    }
    if (app.onlineUsersService) {
      try {
        const onlineUsers = await app.onlineUsersService.getOnlineUsers()
        onlineUsersGauge.set(onlineUsers.length)
      } catch {}
    }
    reply.header('Content-Type', client.register.contentType)
    return client.register.metrics()
  })
  
  return app
}
