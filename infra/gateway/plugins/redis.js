'use strict'

import fp from 'fastify-plugin'
import { createRedisClient } from '../config/redisClient.js'

/**
 * Clear all Redis data (for first-time startup or reset)
 * @param {Object} redis - Redis client
 * @param {Object} fastify - Fastify instance
 */
async function clearAllRedisData(redis, fastify) {
  try {
    await redis.flushAll()
    fastify.log.info('✅ Cleared ALL Redis data (first-time startup)')
  } catch (err) {
    fastify.log.error(`❌ Error clearing all Redis data: ${err.message}`)
  }
}

/**
 * Clear all socket-related Redis data
 * @param {Object} redis - Redis client
 * @param {Object} fastify - Fastify instance
 */
async function clearSocketData(redis, fastify) {
  try {
    const userSocketKeys = await redis.keys('user:*:sockets')
    const socketUserKeys = await redis.keys('socket:*:user')
    const userOnlineKeys = await redis.keys('user:*:online')
    const userRouteKeys = await redis.keys('user:*:route')
    
    const allKeys = [
      ...userSocketKeys,
      ...socketUserKeys,
      ...userOnlineKeys,
      ...userRouteKeys
    ]
    
    if (allKeys.length > 0) {
      await redis.del(allKeys)
      fastify.log.info(`Cleared ${allKeys.length} socket-related keys from Redis`)
    } else {
      fastify.log.info('No socket-related keys found in Redis')
    }
  } catch (err) {
    fastify.log.error(`Error clearing socket data: ${err.message}`)
  }
}

export default fp(async function (fastify, opts) {
  try {
    const client = await createRedisClient()
    
    fastify.decorate('redis', client)    
    
    // Check if we should clear all Redis data (for first-time startup)
    if (process.env.CLEAR_REDIS_ON_START === 'true') {
      await clearAllRedisData(client, fastify)
    } else {
      // Otherwise, just clear socket-related data
      await clearSocketData(client, fastify)
    }
    
    fastify.addHook('onClose', async (instance) => {
      if (instance.redis) {
        await instance.redis.quit()
        fastify.log.info('Redis connection closed')
      }
    })
    
    fastify.log.info('Redis plugin registered')
  } catch (err) {
    fastify.log.error(`Redis plugin error: ${err.message}`)
    throw err
  }
}, {
  name: 'fastify-redis'
}) 