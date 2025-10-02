'use strict'

import fp from 'fastify-plugin'
import { createUserService } from '../utils/userService.js'

export default fp(async function (fastify) {
  if (!fastify.redis) {
    throw new Error('Redis client missing - userService depends on redis plugin')
  }

  if (!fastify.pg) {
    throw new Error('PostgreSQL client missing - userService depends on postgres plugin')
  }

  try {
    const userService = createUserService(fastify, fastify.redis)
    
    // Register the service with fastify instance
    fastify.decorate('userService', userService)
    
    fastify.log.info('[USER_SERVICE] User service initialized and registered')
  } catch (err) {
    fastify.log.error(`[USER_SERVICE] Initialization error: ${err.message}`)
    throw err
  }
}, {
  name: 'fastify-user-service',
  dependencies: ['fastify-redis', 'fastify-postgres']
}) 