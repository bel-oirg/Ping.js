import URController from '../controllers/URC.js'

const createFriend = (fastify, options, done) => {

    fastify.get('/send-req',
        {
            onRequest: [fastify.authenticate]
        }
        ,URController.SendReqC
    )

    fastify.get('/accept-req',
        {
            onRequest: [fastify.authenticate]
        },URController.AcceptReqC)


    fastify.get('/deny-req',
        {
            onRequest: [fastify.authenticate]
        }
        ,URController.DenyReqC)

    fastify.get('/all-relations',
        {onRequest: [fastify.authenticate]},
        URController.AllRelationsC)

    done()
}

export default createFriend