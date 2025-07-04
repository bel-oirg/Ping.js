import kafka from './kafkaClient.js'


const kafkaAdmin = async (fastify, options) => {

    
    const admin = kafka.admin()
    
    // remember to connect and disconnect when you are done
    await admin.connect()
    let topp = await admin.listTopics()

    console.log(`---> ${topp}`)
    console.log('dsakjndask')
    await admin.createTopics({topics : [{topic: "newTOPI", numPartitions: 4, replicationFactor: 2}]})
    await admin.disconnect()
}

export default kafkaAdmin