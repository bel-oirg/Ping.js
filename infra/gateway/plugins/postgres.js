'use strict'

import fp from 'fastify-plugin'
import pkg from 'pg'
import fs from 'fs'

const { Pool } = pkg

function createPool() {
  return new Pool({
    host: 'postgres_db',
    port: 5432,
    user: 'get',
    password: process.env.GET_DB_PASSWORD,
    database: 'get_db',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  })
}

async function initSchema(pool, fastify) {
  try {
    // Load Users schema
    const usersDdl = fs.readFileSync('./models/Users.sql', 'utf-8')
    await pool.query(usersDdl)
    fastify.log.info('[POSTGRES] Users schema ensured')
    
    // Load Notifications schema
    const notificationsDdl = fs.readFileSync('./models/Notifications.sql', 'utf-8')
    await pool.query(notificationsDdl)
    fastify.log.info('[POSTGRES] Notification schema ensured')
  } catch (err) {
    if (err.message.includes('already exists')) {
      fastify.log.info('[POSTGRES] Schema already exists')
    } else {
      fastify.log.error(`[POSTGRES] Failed to init schema: ${err.message}`)
    }
  }
}

export default fp(async function (fastify) {
  const pool = createPool()
  fastify.decorate('pg', pool)

  fastify.addHook('onClose', async (instance) => {
    if (instance.pg) {
      await instance.pg.end()
      instance.log.info('[POSTGRES] Pool closed')
    }
  })

  await initSchema(pool, fastify)
  fastify.log.info('[POSTGRES] Plugin registered')
}, {
  name: 'fastify-postgres'
}) 