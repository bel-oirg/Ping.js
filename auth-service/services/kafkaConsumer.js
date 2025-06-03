// import kafka from '../config/kafkaClient.js'
// import pool from '../config/pooling.js'
// import bcrypt from 'bcrypt'

// const kafkaConsumer = async (fastify) => {
//     try
//     {
//         const consumer = kafka.consumer({ groupId: 'auth-grp' })

//         await consumer.connect()
//         await consumer.subscribe({ topic: 'newPass', fromBeginning: false})

//         consumer.run({
//             eachMessage: async ({ topic, message }) => {
                
//                 if (topic == 'newPass')
//                 {
//                     const {id, new_pass} = JSON.parse(message.value)
//                     console.log('PASSWO111111111RD DONDEONDONEODNEOn')
                    
//                     await pool.query('BEGIN')
                    
//                     await pool.query('UPDATE account SET password = $2 WHERE id = $1;', 
//                         [id, await bcrypt.hash(new_pass, 10)])
                    
//                     console.log('PASSWORD DONDEONDONEODNEOn')
                    
//                     await pool.query('COMMIT')
//                 }
//             },
//         })

//         fastify.addHook('onClose', async() => {
//             await consumer.disconnect()
//         })
//     }
//     catch(err)
//     {
//         await pool.query('ROLLBACK')
//         console.log(`[KAFKA] ${err}`)
//     }
// }

// export default kafkaConsumer