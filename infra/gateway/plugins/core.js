'use strict'

import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import { cors as corsConfig } from '../config/index.js'

export default fp(async function (fastify, opts) {
  await fastify.register(cors, corsConfig)
  await fastify.register(helmet)
  await fastify.register(sensible)
}, {
  name: 'core-plugins'
}) 