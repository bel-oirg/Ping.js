import notifsC from '../controllers/notificationsC.js'

const notifs = (fastify, options, done) => {

    const limit4Schema = {
        schema:
        {
            response:
            { ///sender, type, is_readen, created_at
                '200': { type: 'array', items: {
                     sender: {type:'string'}, notif_type: {type: 'string'},
                     is_readen: {type:'string'}, created_at: {type: 'string'}}
                    },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: notifsC.limit4
    }

    fastify.get('/api/dash/notif/limit4/', limit4Schema)
    fastify.get('/api/dash/notif/detail/', notifsC.detail)
    fastify.get('/api/dash/notif/seen/', notifsC.seen)

    done()
}

export default notifs