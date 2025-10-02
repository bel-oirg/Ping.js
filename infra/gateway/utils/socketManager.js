'use strict'
import { getUnreadNotifications, markAllAsRead, getAllNotifications } from './notificationDbService.js'
import { createOnlineUsersService } from './onlineUsersService.js'

export async function addUserSocket(redis, userId, socketId, userData = null) {
  return await createOnlineUsersService(redis).addUser(userId, socketId, userData)
}

export async function removeUserSocket(redis, socketId) {
  return await createOnlineUsersService(redis).removeUser(socketId)
}

export async function getUserSockets(redis, userId) {
  return await createOnlineUsersService(redis).getUserSockets(userId)
}

export async function isUserOnline(redis, userId) {
  return await createOnlineUsersService(redis).isUserOnline(userId)
}

export async function getOnlineUsers(redis) {
  const users = await createOnlineUsersService(redis).getOnlineUsers()
  return users.map(user => user.userId.toString())
}

export async function getOnlineUsersWithProfiles(redis) {
  const users = await createOnlineUsersService(redis).getOnlineUsers()
  return users
}

export async function sendToUser(io, redis, userId, event, data) {
  return await createOnlineUsersService(redis).sendToUser(io, userId, event, data)
}

export async function getUserProfile(redis, userId) {
  return await createOnlineUsersService(redis).getUserData(userId)
}

async function sendUnreadNotifications(socket, userId, fastify) {
  try {
    const unreadNotifications = await getUnreadNotifications(fastify, userId)
    if (unreadNotifications.length === 1) {
      socket.emit('gateway:notification', unreadNotifications[0])
    } else if (unreadNotifications.length > 1) {
      socket.emit('gateway:notification', unreadNotifications)
    }
  } catch (err) {
    console.error(`Failed to send unread notifications: ${err.message}`)
  }
}

async function sendAllNotifications(fastify, userId, socket) {
  try {
    const notifications = await getAllNotifications(fastify, userId)
    if (notifications.length === 1) {
      socket.emit('gateway:notification', notifications[0])
    } else if (notifications.length > 1) {
      socket.emit('gateway:notification', notifications)
    }
  } catch (err) {
    console.error(`Failed to send all notifications: ${err.message}`)
  }
}

export function initializeSocketHandlers(io, redis, fastify) {
  if (!io) return
  const onlineUsersService = fastify.onlineUsersService || createOnlineUsersService(redis)
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    const id = await getUserIdFromToken(token, fastify)
    if (!id) return next(new Error('unauthorized'))
    socket.userId = id
    socket.userData = socket.handshake.auth.userData || null
    next()
  })

  io.on('connection', async socket => {
    const userId = socket.userId
    if (!userId) return socket.disconnect(true)
    if (socket.userData?.username && fastify.userService) {
      try {
        await fastify.userService.storeUserData({
          id: Number(userId),
          username: socket.userData.username
        })
      } catch (error) {
        console.error(`Error caching user data for ${userId}:`, error)
      }
    }
    const result = await onlineUsersService.addUser(userId, socket.id, socket.userData)
    await sendAllNotifications(fastify, userId, socket)
    await onlineUsersService.sendOnlineUsersList(socket)
    if (result.statusChanged) {
      await onlineUsersService.broadcastUserStatus(io, userId, true)
      onlineUsersService.debouncedBroadcastOnlineUsersList(io)
    } else if (result.timerCleared) {
      await onlineUsersService.broadcastUserStatus(io, userId, true)
      onlineUsersService.debouncedBroadcastOnlineUsersList(io)
    }
    socket.on('notification:all', async () => {
      await sendAllNotifications(fastify, userId, socket)
    })
    socket.on('users:online:get', async () => {
      await onlineUsersService.sendOnlineUsersList(socket)
    })
    socket.on('disconnect', async () => {
      const result = await onlineUsersService.removeUser(socket.id)
      if (result.success) {
        if (result.pendingDisconnection) {
          onlineUsersService.startDisconnectionTimer(result.userId, io)
        } else if (result.statusChanged) {
          await onlineUsersService.broadcastUserStatus(io, userId, false)
          onlineUsersService.debouncedBroadcastOnlineUsersList(io)
        }
      }
    })
    socket.on('notification:seen-all', async () => {
      await markAllAsRead(fastify, userId)
    })

    // Handle sending a chat message: produce to Kafka
    socket.on('gateway:sendMsg', async (msg) => {
      fastify.log.info('[SOCKET] Received gateway:sendMsg:', msg);
      try {
        const result = await fastify.sendKafkaMessage('newMsg', msg);
        fastify.log.info('[KAFKA] Produced message to topic newMsg:', result, msg);
        // Notify receiver if online
        if (msg && msg.receiver) {
          const isOnline = await isUserOnline(fastify.redis, msg.receiver);
          fastify.log.info(`[SOCKET] Receiver user ${msg.receiver} online status:`, isOnline);
          if (isOnline) {
            await sendToUser(io, fastify.redis, msg.receiver, 'gateway:newMsg', msg);
            fastify.log.info(`[SOCKET] Emitted gateway:newMsg to user ${msg.receiver}`);
          }
        }
      } catch (err) {
        fastify.log.error('[KAFKA] Error producing message to topic newMsg:', err);
      }
    });
  })
}

async function getUserIdFromToken(token, fastify) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload.id || payload.sub || payload.userId ? String(payload.id || payload.sub || payload.userId) : null
  } catch {
    return null
  }
}
