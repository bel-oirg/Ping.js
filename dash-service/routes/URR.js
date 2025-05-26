import URController from '../controllers/URC.js'

const createFriend = (fastify, options, done) => {

    fastify.get('/send-req/' ,URController.SendReqC)
    fastify.get('/accept-req/' ,URController.AcceptReqC)
    fastify.get('/deny-req/', URController.DenyReqC)
    fastify.get('/all-relations/', URController.AllRelationsC)
    fastify.get('/unfriend/', URController.unfriendC)
    fastify.get('/cancel/', URController.cancelMyReqC)

    done()
}

export default createFriend