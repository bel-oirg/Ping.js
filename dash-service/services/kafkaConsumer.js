import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'

const kafkaConsumer = async (fastify) => {

    const consumer = kafka.consumer({ groupId: 'consGRP' })

    await consumer.connect()
    await consumer.subscribe({ topic: 'newUser', fromBeginning: true})

    consumer.run({
        eachMessage: async ({ topic, message }) => {
            const {id, username, email, first_name, last_name, is_oauth} = JSON.parse(message.value)
            if (topic == 'newUser')
            {
                await pool.query('INSERT INTO player(id, username, email, first_name, last_name, is_oauth)  \
                        VALUES($1, $2, $3, $4, $5, $6);', [id, username, email, first_name, last_name, is_oauth])
            }
          },
    })
    .catch(err => {
        console.log(err)
    })

    fastify.addHook('onClose', async() => {
        await consumer.disconnect()
    })
}

export default kafkaConsumer