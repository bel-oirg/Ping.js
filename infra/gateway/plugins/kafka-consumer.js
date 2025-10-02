'use strict'

import fp from 'fastify-plugin'
import { handleRelationEvent, handleNewMessage, handleNewUser } from '../utils/kafkaConsumer.js'
import { kafka as kafkaConfig } from '../config/index.js'

export default fp(async function (fastify) {
  if (!fastify.kafka || !fastify.kafka.client) {
    throw new Error('Kafka client missing')
  }

  try {
    const consumer = fastify.kafka.client.consumer({ groupId: kafkaConfig.consumerGroup })

    await consumer.connect()
    await consumer.subscribe({ topic: kafkaConfig.topics.newRelation, fromBeginning: false })
    await consumer.subscribe({ topic: kafkaConfig.topics.newMsg, fromBeginning: false })
    await consumer.subscribe({ topic: kafkaConfig.topics.newUser, fromBeginning: false })

    consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const data = JSON.parse(message.value.toString())
          if (topic === kafkaConfig.topics.newRelation) {
            await handleRelationEvent(data, fastify)
          } else if (topic === kafkaConfig.topics.newMsg) {
            await handleNewMessage(data, fastify)
          } else if (topic === kafkaConfig.topics.newUser) {
            await handleNewUser(data, fastify)
          }
        } catch (err) {
          fastify.log.error(`[KAFKA] Consumer message error for topic ${topic}: ${err.message}`)
        }
      }
    }).catch(err => {
      fastify.log.error(`[KAFKA] Consumer run error: ${err.message}`)
    })

    fastify.log.info('[KAFKA] Consumer ready - subscribed to newRelation, newMsg, and newUser topics')
    fastify.addHook('onClose', async (instance) => {
      try { 
        await consumer.disconnect() 
        fastify.log.info('[KAFKA] Consumer disconnected')
      } catch (err) {
        fastify.log.error(`[KAFKA] Consumer disconnect error: ${err.message}`)
      }
    })
  } catch (err) {
    fastify.log.error(`[KAFKA] Consumer initialization error: ${err.message}`)
    throw err
  }
}, {
  name: 'fastify-kafka-consumer',
  dependencies: ['fastify-kafka']
}) 