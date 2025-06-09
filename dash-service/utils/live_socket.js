import {Server} from 'socket.io'
import UR from '../services/relationsS.js'

function notify_friends(io, to_notify, user_id, status)
{
    if (to_notify) {
        to_notify.forEach(element => {
            io.to(element.socket_id).emit('state', {
                status: status,
                user_id: user_id
            });
            console.log('Notified:', element.user_id, status);
        });
    }
}

const online_state = (fastify, options, done) => {
    const io = new Server(fastify.server, {
        connectionStateRecovery: {}, 
        cors: {
          origin: "http://localhost:8080",
        }
    })

    let to_notify = []
    let online_users = []

    try{
        io.use(async (socket, next) => { //middleware
                if (!socket.handshake.query || !socket.handshake.query.token)
                    next(new Error('Auth err'))

                socket.decoded = await fastify.jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET)

                const all_friends = await UR.FriendListID(socket.decoded.id)

                to_notify = online_users.filter((online) => {
                    if (all_friends.includes(online.user_id))
                        return online
                })

                notify_friends(io, to_notify, socket.decoded.id, 'online')

                online_users.push({user_id:socket.decoded.id, socket_id: socket.id}) //add on db

                next()
        })

        io.on('connection', async(socket) => {

            socket.on('disconnect', async () => {

                const all_friends = await UR.FriendListID(socket.decoded.id)

                to_notify = online_users.filter((online) => {
                    if (all_friends.includes(online.user_id))
                        return online
                })

                notify_friends(io, to_notify, socket.decoded.id, 'offline')

                online_users = online_users.filter((user) => user.user_id !== socket.decoded.id)
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