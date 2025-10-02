'use strict'

export async function cleanupRedisData(redis) {
  try {    
    const socketKeys = await redis.keys('socket:*:user')
    const userKeys = await redis.keys('user:*')
    
    if (socketKeys.length > 0) {
      await redis.del(...socketKeys)
    }
    
    if (userKeys.length > 0) {
      await redis.del(...userKeys)
    }

    return { success: true, cleaned: { sockets: socketKeys.length, users: userKeys.length } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function gracefulRedisCleanup(redis) {
  try {
    const socketKeys = await redis.keys('socket:*:user')
    const userKeys = await redis.keys('user:*')
    
    if (socketKeys.length > 0) {
      await redis.del(...socketKeys)
    }
    
    return { success: true, cleaned: { sockets: socketKeys.length, usersReset: userKeys.length } }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Alternative: Clean only specific data types
export async function cleanupSocketData(redis) {
  try {
    const socketKeys = await redis.keys('socket:*:user')
    if (socketKeys.length > 0) {
      await redis.del(...socketKeys)
    }
    return { success: true, cleaned: socketKeys.length }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function cleanupUserData(redis) {
  try {
    const userKeys = await redis.keys('user:*')
    if (userKeys.length > 0) {
      await redis.del(...userKeys)
    }
    return { success: true, cleaned: userKeys.length }
  } catch (error) {
    return { success: false, error: error.message }
  }
} 