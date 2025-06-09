import {Server} from 'socket.io'

const online_state = (fastify, options, done) => {
    const io = new Server(fastify.server, {connectionStateRecovery: {}})
    let to_notify = []
    let online_users = new Map()

    try{
        io.use(async (socket, next) => { //middleware
            if (!socket.handshake.query || !socket.handshake.query.token)
                next(new Error('Auth err'))

            socket.decoded = await fastify.jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET)

            online_users.set(socket.decoded.id, socket.id)
            next()
        })

        io.on('connection', async (socket) => {

            socket.on('msg', (json_data) => {
                const raw = JSON.parse(json_data)
                const receiver = raw.receiver
                const data = raw.data

                io.to(online_users.get(receiver)).emit("msg", data)
            })

            socket.on('disconnect', async () => {

                online_users.delete(socket.decoded.id)
            })
        })
    }
    catch(err)
    {
        console.log(err)
    }
    
    done()
}

export default online_state