import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'consGRP' })

        await consumer.connect()
        await consumer.subscribe({ topic: 'newUser', fromBeginning: false})

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                
                if (topic == 'newUser')
                {
                    const {id, username, email, first_name, last_name, is_oauth} = JSON.parse(message.value)
                    
                    await pool.query('BEGIN')
                    
                    await pool.query('INSERT INTO player(id, username, email, first_name, last_name, is_oauth)  \
                            VALUES($1, $2, $3, $4, $5, $6);', [id, username, email, first_name, last_name, is_oauth])
                    
                    await pool.query('COMMIT')
                }
            },
        })

        fastify.addHook('onClose', async() => {
            await consumer.disconnect()
        })
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        console.log(`[KAFKA] ${err}`)
    }
}

export default kafkaConsumer