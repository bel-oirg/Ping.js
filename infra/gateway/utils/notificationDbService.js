'use strict'

export async function saveNotification(fastify, notification) {
  if (!fastify?.pg || !notification || ![1, 2].includes(notification.type)) return false
  try {
    await fastify.pg.query(
      `INSERT INTO notifications (id, type, sender_id, receiver_id, created_at, read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        notification.id,
        notification.type,
        notification.sender,
        notification.receiver,
        notification.created_at,
        false
      ]
    )
    return true
  } catch (err) {
    console.error('Error saving notification:', err)
    return false
  }
}

export async function saveNotificationsBatch(fastify, notifications) {
  if (!fastify?.pg || !Array.isArray(notifications) || notifications.length === 0) return false
  try {
    const values = notifications.map(n => [
      n.id,
      n.type,
      n.sender,
      n.receiver,
      n.created_at,
      false
    ])
    const query = `INSERT INTO notifications (id, type, sender_id, receiver_id, created_at, read)
      VALUES ${values.map((_, i) => `($${i*6+1},$${i*6+2},$${i*6+3},$${i*6+4},$${i*6+5},$${i*6+6})`).join(',')}`
    await fastify.pg.query(query, values.flat())
    return true
  } catch (err) {
    console.error('Error saving batch notifications:', err)
    return false
  }
}

export async function getUnreadNotifications(fastify, userId) {
  if (!fastify?.pg || !userId) return []
  try {
    const result = await fastify.pg.query(
      `SELECT * FROM notifications WHERE receiver_id = $1 AND read = false ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      sender: row.sender_id,
      receiver: row.receiver_id,
      created_at: row.created_at.toISOString(),
      read: false
    }))
  } catch (err) {
    console.error('Error getting unread notifications:', err)
    return []
  }
}

export async function getAllNotifications(fastify, userId) {
  if (!fastify?.pg || !userId) return []
  try {
    const result = await fastify.pg.query(
      `SELECT * FROM notifications WHERE receiver_id = $1 ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      sender: row.sender_id,
      receiver: row.receiver_id,
      created_at: row.created_at.toISOString(),
      read: row.read
    }))
  } catch (err) {
    console.error('Error getting all notifications:', err)
    return []
  }
}

export async function markAllAsRead(fastify, userId) {
  if (!fastify?.pg || !userId) return false
  try {
    await fastify.pg.query(
      `UPDATE notifications SET read = true WHERE receiver_id = $1 AND read = false`,
      [userId]
    )
    return true
  } catch (err) {
    console.error('Error marking notifications as read:', err)
    return false
  }
} 