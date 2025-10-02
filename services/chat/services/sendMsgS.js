import pool from "../config/pooling.js"
import kafkaProd from '../utils/kafkaProd.js'

const sendMsgS = async (accountID, otherID, data) => {

    if (!data)
        throw new Error('Empty msg')

    if (data.length > 100)
        throw new Error('Message too long')

    if (accountID == otherID)
        throw new Error('you cannot send a msg to yourself')

    const friendCheck = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2)',
        [accountID, otherID])
    
    if (!friendCheck.rows[0].exists) {
        throw new Error('Cannot send message: User is not in your friends list')
    }

    const user1 = Math.max(accountID, otherID)
    const user2 = Math.min(accountID, otherID)

    const created = new Date()

    await kafkaProd('newMsg', {
        sender: accountID,
        receiver: otherID,
        msg: data,
        created_at: created
    })

    await pool.query('INSERT INTO msg(user1, user2, sender, data, created_at) \
        VALUES($1, $2, $3, $4, $5)', [user1, user2, accountID, data, created])

}

export default sendMsgS