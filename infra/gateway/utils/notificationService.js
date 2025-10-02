'use strict'

import { sendToUser } from './socketManager.js'
import { saveNotification } from './notificationDbService.js'
import { randomUUID } from 'crypto'

export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST_RECEIVED: 1,
  FRIEND_REQUEST_ACCEPTED: 2,
  FRIENDSHIP_UPDATED: 3,
  NEW_CHAT_MESSAGE: 4
}

async function createNotification(fastify, type, data) {
  return {
    id: data.id || `${Date.now()}-${randomUUID()}`,
    type,
    sender: {
      id: Number(data.sender)
    },
    receiver: {
      id: Number(data.receiver)
    },
    created_at: data.created_at || new Date().toISOString(),
    read: false,
    ...(type === NOTIFICATION_TYPES.NEW_CHAT_MESSAGE ? { msg: data.msg || '' } : {})
  }
}

function createNotificationsBatch(fastify, type, dataArray) {
  return Promise.all(dataArray.map(data => createNotification(fastify, type, data)))
}

export async function notifyUser(fastify, userId, type, data) {
  if (!fastify?.io || !fastify?.redis || !userId) return { success: false }
  try {
    const numericType = typeof type === 'string' ? parseInt(type, 10) : type
    const notification = await createNotification(fastify, numericType, data)
    if ([NOTIFICATION_TYPES.FRIEND_REQUEST_RECEIVED, NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED, NOTIFICATION_TYPES.NEW_CHAT_MESSAGE].includes(numericType)) {
      await saveNotification(fastify, {
        id: notification.id,
        type: notification.type,
        sender: notification.sender.id,
        receiver: notification.receiver.id,
        created_at: notification.created_at
      })
    }
    return await sendToUser(fastify.io, fastify.redis, userId, 'gateway:notification', notification)
  } catch (error) {
    fastify.log.error(`Error sending notification to user ${userId}:`, error)
    return { success: false, error }
  }
}

export async function notifyUsersBatch(fastify, userIds, type, dataArray) {
  if (!fastify?.io || !fastify?.redis || !Array.isArray(userIds) || userIds.length === 0) return { success: false }
  try {
    const notifications = await createNotificationsBatch(fastify, type, dataArray)
    if ([NOTIFICATION_TYPES.FRIEND_REQUEST_RECEIVED, NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED, NOTIFICATION_TYPES.NEW_CHAT_MESSAGE].includes(type)) {
      await saveNotificationsBatch(fastify, notifications.map(n => ({
        id: n.id,
        type: n.type,
        sender: n.sender.id,
        receiver: n.receiver.id,
        created_at: n.created_at
      })))
    }
    for (let i = 0; i < userIds.length; i++) {
      await sendToUser(fastify.io, fastify.redis, userIds[i], 'gateway:notification', notifications[i])
    }
    return { success: true }
  } catch (error) {
    fastify.log.error('Error sending batch notifications:', error)
    return { success: false, error }
  }
}

export default { notifyUser, NOTIFICATION_TYPES } 