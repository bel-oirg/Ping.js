import kafka from './kafkaClient.js'
import pool from './pooling.js'

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'auth-grp' })
        console.log('[KAFKA] Consumer created')

        await consumer.connect()
        await consumer.subscribe({ topic: 'OTP', fromBeginning: false})

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                try
                {         
                    if (topic == 'OTP')
                    {
                        const {id, activate} = JSON.parse(message.value)
                        await pool.query('UPDATE account SET is_otp = $2   \
                        WHERE id = $1;', [id, activate == 1 ? true : false])
                    }
                }
                catch(err)
                {
                    console.log(`[KAFKA] Error processing message: ${err}`)
                }
            },
        })

        fastify.addHook('onClose', async() => {
            await consumer.disconnect()
        })
    }
    catch(err)
    {
        console.log(`[KAFKA] ${err}`)
    }
}

export default kafkaConsumer