'use strict'

import { notifyUser } from './notificationService.js'
import { NOTIFICATION_TYPES } from './notificationService.js'

export async function handleRelationEvent(event, fastify) {
  const { sender, receiver, requestType } = event
  const senderId = Number(sender)
  const receiverId = Number(receiver)
  switch (requestType) {
    case 1:
      await notifyUser(fastify, receiverId, NOTIFICATION_TYPES.FRIEND_REQUEST_RECEIVED, {
        sender: senderId,
        receiver: receiverId
      })
      await notifyUser(fastify, receiverId, NOTIFICATION_TYPES.FRIENDSHIP_UPDATED, { 
        sender: senderId, 
        receiver: receiverId
      })
      break
    case 2:
      await notifyUser(fastify, receiverId, NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED, {
        sender: senderId,
        receiver: receiverId
      })
      await notifyUser(fastify, senderId, NOTIFICATION_TYPES.FRIENDSHIP_UPDATED, { 
        sender: senderId, 
        receiver: receiverId
      })
      await notifyUser(fastify, receiverId, NOTIFICATION_TYPES.FRIENDSHIP_UPDATED, { 
        sender: senderId, 
        receiver: receiverId
      })
      break
    default:
      await notifyUser(fastify, senderId, NOTIFICATION_TYPES.FRIENDSHIP_UPDATED, { 
        sender: senderId, 
        receiver: receiverId
      })
      await notifyUser(fastify, receiverId, NOTIFICATION_TYPES.FRIENDSHIP_UPDATED, { 
        sender: senderId, 
        receiver: receiverId
      })
  }
}

export async function handleNewMessage(event, fastify) {
  const { sender, receiver, msg } = event
  const senderId = Number(sender)
  const receiverId = Number(receiver)
  await notifyUser(fastify, receiverId, NOTIFICATION_TYPES.NEW_CHAT_MESSAGE, {
    sender: senderId,
    receiver: receiverId,
    msg,
  })
}

export async function handleNewUser(event, fastify) {
  fastify.log.info('[KAFKA] handleNewUser called with:', event)
  try {
    const userService = fastify.userService
    const userData = {
      id: Number(event.id),
      username: event.username,
      avatar: event.avatar || ''
    }
    fastify.log.info('[KAFKA] Storing user data:', userData)
    const result = await userService.storeUserData(userData)
    fastify.log.info('[KAFKA] storeUserData result:', result)
  } catch (error) {
    fastify.log.error('[KAFKA] Error processing new user event:', error)
  }
}
