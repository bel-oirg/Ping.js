import kafka from './kafkaClient.js'

const kafkaProd = async (topic, raw_data) => {
    const prod = kafka.producer()
    if (raw_data?.sender) raw_data.sender = Number(raw_data.sender)
    if (raw_data?.receiver) raw_data.receiver = Number(raw_data.receiver)
    await prod.connect()
    await prod.send({
            topic: topic,
            messages : [ {value : JSON.stringify(raw_data)} ]
    })
    await prod.disconnect()

}

export default kafkaProd