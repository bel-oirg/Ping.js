import URController from '../controllers/relationsC.js'

const createFriend = (fastify, options, done) => {

    fastify.get('/api/dash/send-req/' ,URController.SendReqC)
    fastify.get('/api/dash/cancel/', URController.cancelMyReqC)
    fastify.get('/api/dash/accept-req/' ,URController.AcceptReqC)
    fastify.get('/api/dash/deny-req/', URController.DenyReqC)
    fastify.get('/api/dash/unfriend/', URController.unfriendC)
    
    fastify.get('/all-relations/', URController.AllRelationsC)
    
    fastify.get('/api/dash/block/', URController.blockUserC)
    fastify.get('/api/dash/unblock/', URController.unblockUserC)
    
    done()
}

export default createFriend