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

    // fastify.get('/received-req',
    //     {
    //         onRequest: [fastify.authenticate]
    //     }
    //     ,async (req, res) => {

    //     const relation = await models.Friends.findOne({ where :
    //         {FriendID:req.user.id, status:'pending'}})

    //     res.send(relation)
    // })

    // fastify.get('/sent-req',
    //     {
    //         onRequest: [fastify.authenticate]
    //     }
    //     ,async (req, res) => {

    //     const relation = await models.Friends.findOne({ where :
    //         {AccountID:req.user.id, status:'pending'}})

    //     res.send(relation)
    // })

    // fastify.get('/friends',
    //     {
    //         onRequest: [fastify.authenticate]
    //     }
    //     ,async (req, res) => {

    //     const relation = await models.Friends.findOne({ where : 
    //         { [Op.or] :
    //             [
    //                 {AccountID:req.user.id, status:'friends'},
    //                 {FriendID:req.user.id, status:'friends'},
    //             ]
    //         }
    //     })

    //     res.send(relation)
    // })

    // fastify.get('/blocked',
    //     {
    //         onRequest: [fastify.authenticate]
    //     }
    //     ,async (req, res) => {

    //         const relation = await models.Friends.findOne({ where : 
    //             { [Op.or] :
    //                 [
    //                     {AccountID:req.user.id, status:'blocked'},
    //                     {FriendID:req.user.id, status:'blocked'},
    //                 ]
    //             }
    //         })

    //     res.send(relation)
    // })

    done()
}

export default createFriend