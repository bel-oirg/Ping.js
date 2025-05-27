import URController from '../controllers/relationsC.js'

const createFriend = (fastify, options, done) => {

    fastify.get('/send-req/' ,URController.SendReqC)
    fastify.get('/cancel/', URController.cancelMyReqC)
    fastify.get('/accept-req/' ,URController.AcceptReqC)
    fastify.get('/deny-req/', URController.DenyReqC)

    fastify.get('/all-relations/', URController.AllRelationsC)
    fastify.get('/unfriend/', URController.unfriendC)

    fastify.get('/block/', URController.blockUserC)
    fastify.get('/unblock/', URController.unblockUserC)
    done()
}

export default createFriend