'use strict'

export class OnlineUsersService {
  constructor(redis, userService) {
    this.redis = redis
    this.userService = userService
    this.broadcastTimeout = null
    this.disconnectionTimers = new Map()
    this.OFFLINE_DELAY = 30000
    this.LAST_ONLINE_EXPIRY = 60 * 60 * 24 * 30
  }

  async addUser(userId, socketId, userData = null) {
    if (!userId || !socketId) return { success: false }
    try {
      if (this.disconnectionTimers.has(userId)) {
        clearTimeout(this.disconnectionTimers.get(userId))
        this.disconnectionTimers.delete(userId)
        await this.redis.set(`socket:${socketId}:user`, userId)
        if (userData && userData.username) {
          await this.redis.set(`user:${userId}:username`, userData.username)
        }
        const currentTime = Date.now()
        await this.redis.set(`user:${userId}:last_online`, String(currentTime))
        return { success: true, statusChanged: false, timerCleared: true }
      }
      const wasOffline = !(await this.isUserOnline(userId))
      await this.redis.set(`socket:${socketId}:user`, userId)
      if (userData && userData.username) {
        await this.redis.set(`user:${userId}:username`, userData.username)
      }
      const currentTime = Date.now()
      await this.redis.set(`user:${userId}:last_online`, String(currentTime))
      return { success: true, statusChanged: wasOffline, timerCleared: false }
    } catch {
      return { success: false }
    }
  }

  async removeUser(socketId) {
    if (!socketId) return { success: false }
    try {
      const userId = await this.redis.get(`socket:${socketId}:user`)
      if (!userId) return { success: false }
      await this.redis.del(`socket:${socketId}:user`)
      const hasOtherConnections = await this.isUserOnline(userId)
      if (!hasOtherConnections) {
        return { success: true, userId, statusChanged: false, pendingDisconnection: true }
      }
      return { success: true, userId, statusChanged: false }
    } catch {
      return { success: false }
    }
  }

  async getOnlineUsers() {
    try {
      const socketKeys = await this.redis.keys('socket:*:user')
      const userIds = []
      for (const key of socketKeys) {
        const userId = await this.redis.get(key)
        if (userId && !userIds.includes(userId)) {
          userIds.push(userId)
        }
      }
      const users = []
      for (const userId of userIds) {
        const username = await this.redis.get(`user:${userId}:username`)
        const lastOnlineTime = await this.getLastOnlineTime(userId)
        users.push({
          userId: Number(userId),
          username: username || `User${userId}`,
          status: 'online',
          timestamp: Date.now(),
          lastOnlineTime
        })
      }
      return users
    } catch (err) {
      return []
    }
  }

  async getUserData(userId) {
    const username = await this.redis.get(`user:${userId}:username`)
    return username ? { id: Number(userId), username } : null
  }

  async getUserSockets(userId) {
    try {
      const socketKeys = await this.redis.keys('socket:*:user')
      const userSockets = []
      for (const key of socketKeys) {
        const socketUserId = await this.redis.get(key)
        if (socketUserId === String(userId)) {
          const socketId = key.split(':')[1]
          userSockets.push(socketId)
        }
      }
      return userSockets
    } catch {
      return []
    }
  }

  async isUserOnline(userId) {
    try {
      const socketKeys = await this.redis.keys('socket:*:user')
      for (const key of socketKeys) {
        const socketUserId = await this.redis.get(key)
        if (socketUserId === String(userId)) {
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }

  async broadcastUserStatus(io, userId, isOnline, additionalData = null) {
    try {
      const username = additionalData?.username || (await this.redis.get(`user:${userId}:username`)) || `User${userId}`
      const payload = {
        userId: Number(userId),
        isOnline,
        status: isOnline ? 'online' : 'offline',
        username,
        timestamp: Date.now(),
        lastOnlineTime: await this.getLastOnlineTime(userId)
      }
      io.emit('user:status', payload)
    } catch (err) {}
  }

  async broadcastOnlineUsersList(io) {
    const users = await this.getOnlineUsers()
    io.emit('users:online', { users, timestamp: Date.now() })
  }

  debouncedBroadcastOnlineUsersList(io, delay = 100) {
    if (this.broadcastTimeout) clearTimeout(this.broadcastTimeout)
    this.broadcastTimeout = setTimeout(async () => {
      await this.broadcastOnlineUsersList(io)
      this.broadcastTimeout = null
    }, delay)
  }

  async sendOnlineUsersList(socket) {
    const users = await this.getOnlineUsers()
    socket.emit('users:online', { users, timestamp: Date.now() })
  }

  async sendToUser(io, userId, event, data) {
    const sockets = await this.getUserSockets(userId)
    if (!sockets.length) return { success: false, sent: 0, total: 0 }
    let sent = 0
    for (const socketId of sockets) {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        try {
          socket.emit(event, data)
          sent++
        } catch {}
      } else {
        await this.removeUser(socketId)
      }
    }
    return { success: sent > 0, sent, total: sockets.length }
  }

  async debugOnlineUsers() {
    try {
      const socketKeys = await this.redis.keys('socket:*:user')
      const userIds = []
      for (const key of socketKeys) {
        const userId = await this.redis.get(key)
        if (userId && !userIds.includes(userId)) {
          userIds.push(userId)
        }
      }
      const debug = {
        socketCount: socketKeys.length,
        uniqueUserCount: userIds.length,
        users: []
      }
      for (const userId of userIds) {
        const username = await this.redis.get(`user:${userId}:username`)
        debug.users.push({
          userId,
          username: username || null
        })
      }
      return debug
    } catch (error) {
      return { error: error.message }
    }
  }

  startDisconnectionTimer(userId, io) {
    if (this.disconnectionTimers.has(userId)) {
      clearTimeout(this.disconnectionTimers.get(userId))
    }
    const timer = setTimeout(async () => {
      const isOnline = await this.isUserOnline(userId)
      if (isOnline) {
        this.disconnectionTimers.delete(userId)
        return
      }
      const currentTime = Date.now()
      await this.redis.set(`user:${userId}:last_online`, String(currentTime))
      await this.redis.expire(`user:${userId}:last_online`, this.LAST_ONLINE_EXPIRY)
      await this.broadcastUserStatus(io, userId, false)
      this.debouncedBroadcastOnlineUsersList(io)
      this.disconnectionTimers.delete(userId)
    }, this.OFFLINE_DELAY)
    this.disconnectionTimers.set(userId, timer)
  }

  async getLastOnlineTime(userId) {
    try {
      let lastOnline = await this.redis.get(`user:${userId}:last_online`)
      return lastOnline ? Number(lastOnline) : null
    } catch {
      return null
    }
  }
}

export function createOnlineUsersService(redis, userService) {
  return new OnlineUsersService(redis, userService)
} 