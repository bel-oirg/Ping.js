'use strict'

import fp from 'fastify-plugin'
import { Kafka } from 'kafkajs'
import { kafka as kafkaConfig } from '../config/index.js'

export default fp(async function (fastify) {
  const kafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers
  })
  
  const producer = kafka.producer()
  
  try {
    await producer.connect()
    fastify.log.info('[KAFKA] Producer connected')
    
    fastify.decorate('kafka', {
      client: kafka,
      producer
    })
    
    fastify.decorate('sendKafkaMessage', async (topic, message, options = {}) => {
      try {
        await producer.send({
          topic,
          messages: [{ value: JSON.stringify(message) }],
          ...options
        })
        return true
      } catch (err) {
        fastify.log.error(`Error sending Kafka message: ${err.message}`)
        return false
      }
    })

    fastify.decorate('newMesg', async (topic, message, options = {}) => {
      try {
        await producer.send({
          topic,
          messages: [{ value: JSON.stringify(message) }],
          ...options
        })
        return true
      } catch (err) {
        fastify.log.error(`Error sending Kafka message: ${err.message}`)
        return false
      }
    })
    
    fastify.addHook('onClose', async (instance) => {
      if (instance.kafka && instance.kafka.producer) {
        await instance.kafka.producer.disconnect()
        fastify.log.info('[KAFKA] Producer disconnected')
      }
    })
  } catch (err) {
    fastify.log.error(`[KAFKA] Producer connection error: ${err.message}`)
    throw err
  }
}, {
  name: 'fastify-kafka'
})
