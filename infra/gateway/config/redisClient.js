'use strict'

import { createClient } from 'redis'
import { redis as redisConfig } from './index.js'

export async function createRedisClient() {
  const client = createClient({
    socket: {
      host: redisConfig.host,
      port: redisConfig.port
    },
    password: redisConfig.password
  })

  client.on('error', (err) => {
    console.error('Redis client error:', err.message)
  })

  client.on('connect', () => {
    console.info('Redis client connected')
  })

  client.on('reconnecting', () => {
    console.info('Redis client reconnecting')
  })

  client.on('end', () => {
    console.info('Redis client connection closed')
  })

  await client.connect()
  return client
}

export default { createRedisClient } 