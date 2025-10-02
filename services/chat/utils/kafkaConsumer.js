import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'

const newUserConsumer = async (message) => {
    let {id, username, first_name, last_name, avatar} = JSON.parse(message.value)
    
	if (!avatar)
		avatar = '/data/avatars/default.png'
                    
    await pool.query('INSERT INTO chatter(id, username, first_name, last_name, avatar)  \
        VALUES($1, $2, $3, $4, $5);', [id, username, first_name, last_name, avatar])
}


const newRelationConsumer = async(message) => {
    const { sender, receiver, requestType } = JSON.parse(message.value)       

    if (requestType === 2) {
        await pool.query('INSERT INTO friends(user_id, friend_id) VALUES($1, $2) \
            ON CONFLICT (user_id, friend_id) DO NOTHING;', [sender, receiver])
        await pool.query('INSERT INTO friends(user_id, friend_id) VALUES($1, $2) \
            ON CONFLICT (user_id, friend_id) DO NOTHING;', [receiver, sender])                            
    }
    else if (requestType === -1) {
        await pool.query('DELETE FROM friends WHERE \
            (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1);', 
            [sender, receiver])                            
    }
    else if (requestType === -3) {
        await pool.query('DELETE FROM friends WHERE \
            (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1);', 
            [sender, receiver])
    }
}

const newMsgConsumer = async (message) => {
    const { sender, receiver, msg, created_at } = JSON.parse(message.value)  

    if (!msg)
        throw new Error('Empty msg')

    if (msg.length > 100)
        throw new Error('Message too long')

    if (sender == receiver)
        throw new Error('you cannot send a msg to yourself')

    const userCheck = await pool.query(
        'SELECT id FROM chatter WHERE id = $1 OR id = $2', [sender, receiver]);

    if (userCheck.rowCount !== 2)
        throw new Error('Sender or receiver does not exist');

    await pool.query('INSERT INTO msg(user1, user2, sender, data, created_at) \
        VALUES($1, $2, $3, $4, $5)', [sender > receiver ? sender : receiver, sender > receiver ? receiver : sender, sender, msg, created_at])
}

const updateAvatarConsumer = async (message) => {
    const { id, value } = JSON.parse(message.value)      

    await pool.query('UPDATE chatter \
    SET avatar = $1 WHERE id = $2', [value, id])
}

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'chat-grp' })

        await consumer.connect()
        await consumer.subscribe({ topic: 'newUser', fromBeginning: false})
        await consumer.subscribe({ topic: 'newRelation', fromBeginning: false})
        await consumer.subscribe({ topic: 'updateAvatar', fromBeginning: false})
        await consumer.subscribe({ topic: 'newMsg', fromBeginning: false})

        fastify.addHook('onClose', async() => {
            await consumer.disconnect()
        })

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                try
                {
                    if (topic === 'newUser')
                        await newUserConsumer(message)
                    else if (topic === 'newRelation') 
                        await newRelationConsumer(message)
                    else if (topic === 'updateAvatar')
                        await updateAvatarConsumer(message)
                    else if (topic === 'newMsg')
                        await newMsgConsumer(message)
                }
                catch(err)
                {
                    console.error(`[KAFKA] Error processing message: ${err}`)
                }
            },
        })


    }
    catch(err)
    {
        console.log(`[KAFKA] ${err}`)
    }
}

export default kafkaConsumer