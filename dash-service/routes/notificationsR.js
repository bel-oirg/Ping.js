import notifsC from '../controllers/notificationsC.js'

const notifs = (fastify, options, done) => {
    fastify.post('/api/dash/notif/limit4/', notifsC.limit4)
    fastify.post('/api/dash/notif/detail/', notifsC.detail)
    fastify.post('/api/dash/notif/seen/', notifsC.seen)

    done()
}

export default notifs