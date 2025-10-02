'use strict'

const USER_CACHE_TTL = 86400 // 24 hours

export class UserService {
  constructor(fastify, redis) {
    this.fastify = fastify
    this.redis = redis
  }

  static formatUserData(userData) {
    return {
      id: Number(userData.id),
      username: userData.username,
      avatar: userData.avatar
    }
  }

  async getUserData(userId) {
    if (!userId) return null
    try {
      const userKey = `user_cache:${userId}`
      let userData = await this.redis.hGetAll(userKey)
      if (userData && userData.id) {
        return UserService.formatUserData(userData)
      }
      const result = await this.fastify.pg.query(
        'SELECT id, username, avatar FROM users WHERE id = $1',
        [userId]
      )
      if (result.rows.length === 0) return null
      userData = result.rows[0]
      const formattedData = UserService.formatUserData(userData)
      await this.redis.hSet(userKey, formattedData)
      await this.redis.expire(userKey, USER_CACHE_TTL)
      return formattedData
    } catch {
      return null
    }
  }

  async getMultipleUsersData(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) return {}
    const results = {}
    const uncachedUserIds = []
    for (const userId of userIds) {
      const userData = await this.getUserData(userId)
      if (userData) {
        results[userId] = userData
      } else {
        uncachedUserIds.push(userId)
      }
    }
    if (uncachedUserIds.length > 0) {
      try {
        const placeholders = uncachedUserIds.map((_, index) => `$${index + 1}`).join(',')
        const result = await this.fastify.pg.query(
          `SELECT id, username, avatar FROM users WHERE id IN (${placeholders})`,
          uncachedUserIds
        )
        for (const user of result.rows) {
          const formattedData = UserService.formatUserData(user)
          results[user.id] = formattedData
          const userKey = `user_cache:${user.id}`
          await this.redis.hSet(userKey, formattedData)
          await this.redis.expire(userKey, USER_CACHE_TTL)
        }
      } catch {}
    }
    return results
  }

  async storeUserData(userData) {
    if (!userData?.id) return { success: false }
    try {
      const result = await this.fastify.pg.query(
        `INSERT INTO users (id, username, avatar)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) 
         DO UPDATE SET 
           username = EXCLUDED.username,
           avatar = EXCLUDED.avatar,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          userData.id,
          userData.username || '',
          userData.avatar || ''
        ]
      )
      const user = result.rows[0]
      const formattedData = UserService.formatUserData(user)
      const userKey = `user_cache:${user.id}`
      await this.redis.hSet(userKey, formattedData)
      await this.redis.expire(userKey, USER_CACHE_TTL)
      return { success: true, data: formattedData }
    } catch (error) {
      return { success: false, error }
    }
  }

  async getMultipleUsersForNotifications(userIds) {
    const usersData = await this.getMultipleUsersData(userIds)
    const enrichedUsers = {}
    for (const [userId, userData] of Object.entries(usersData)) {
      enrichedUsers[userId] = {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        displayName: this.getDisplayName(userData)
      }
    }
    return enrichedUsers
  }

  getDisplayName(userData) {
    if (userData.first_name || userData.last_name) {
      return `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    }
    return userData.username || `User${userData.id}`
  }

  async invalidateUserCache(userId) {
    try {
      await this.redis.del(`user_cache:${userId}`)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async getStats() {
    try {
      const keys = await this.redis.keys('user_cache:*')
      return {
        cache: {
          total_cached_users: keys.length,
          keys: keys.map(key => key.replace('user_cache:', ''))
        },
        timestamp: Date.now()
      }
    } catch {
      return { cache: { total_cached_users: 0, keys: [] }, timestamp: Date.now() }
    }
  }
}

export function createUserService(fastify, redis) {
  return new UserService(fastify, redis)
}

// Export a helper for other services to fetch user profile data
export async function fetchUserProfile(userService, userId) {
  return userService.getUserData(userId)
} 