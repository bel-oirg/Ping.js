'use strict'

const isProduction = process.env.NODE_ENV === 'production'

// Define allowed origins based on environment
const allowedOrigins = isProduction 
  ? [
      'https://blackholejs.art',
      process.env.ADDITIONAL_ORIGIN
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://frontend:3000',
      'https://blackholejs.art',
      'http://blackholejs.art'
    ]

export const cors = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'Upgrade',
    'Connection'
  ],
  credentials: true,
  preflightContinue: true,
  exposedHeaders: ['set-cookie']
}

export const server = {
  port: parseInt(process.env.PORT || '8000', 10),
  host: process.env.HOST || '0.0.0.0'
}

export const kafka = {
  clientId: process.env.KAFKA_CLIENT_ID || 'gateway-service',
  brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['kafka:9092'],
  topics: {
    newRelation: process.env.KAFKA_TOPIC_NEW_RELATION || 'newRelation',
    newMsg: process.env.KAFKA_TOPIC_NEW_MSG || 'newMsg',
    newUser: process.env.KAFKA_TOPIC_NEW_USER || 'newUser'
  },
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'gateway-grp',
  createPartitioner: process.env.KAFKA_PARTITIONER || 'LegacyPartitioner',
  ssl: isProduction ? {
    rejectUnauthorized: process.env.KAFKA_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : undefined
}

export const redis = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || 'redispassword',
  tls: isProduction && process.env.REDIS_TLS === 'true' ? {} : undefined
}

export default {
  cors,
  server,
  kafka,
  redis
} 