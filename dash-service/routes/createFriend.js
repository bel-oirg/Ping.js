import {models} from "../config/db.js"
import { Op } from 'sequelize';

const createFriend = (fastify, options, done) => {

    fastify.get('/send-req',
        {
            onRequest: [fastify.authenticate]
        }
        ,async (req, res) => {

        const receiver = await models.Account.findByPk(req.query['id'])
        if (!receiver)
            res.status(400).send('Account not found')
        if (receiver.id == req.user.id)
        {
            res.status(400).send('You can not sent req to yourself')
        }

        const relation = await models.Friends.findOne(
            { where :{ [Op.or] : [
            {AccountID:receiver.id, FriendID:req.user.id},
            {AccountID:req.user.id, FriendID:receiver.id}
            ]
        },})

        if (relation)
            res.status(400).send('The Current relation, does not allow sending new fr_req')
            
        await models.Friends.create({AccountID:req.user.id, FriendID:receiver.id})
        res.send(await models.Friends.findAll())
    })

    fastify.get('/accept-req',
        {
            onRequest: [fastify.authenticate]
        }
        ,async (req, res) => {

        const sender = await models.Account.findByPk(req.query['id'])
        if (!sender)
            res.status(400).send('Account not found')

        const relation = await models.Friends.findOne({ where :
            {AccountID:sender.id, FriendID:req.user.id, status:'pending'}})

        if (!relation)
            res.status(400).send('The relation, does not exist')

            
        await relation.update({status:'friends'})

        res.send(await models.Friends.findAll())
    })

    fastify.get('/received-req',
        {
            onRequest: [fastify.authenticate]
        }
        ,async (req, res) => {

        const relation = await models.Friends.findOne({ where :
            {FriendID:req.user.id, status:'pending'}})

        res.send(relation)
    })

    fastify.get('/sent-req',
        {
            onRequest: [fastify.authenticate]
        }
        ,async (req, res) => {

        const relation = await models.Friends.findOne({ where :
            {AccountID:req.user.id, status:'pending'}})

        res.send(relation)
    })

    fastify.get('/friends',
        {
            onRequest: [fastify.authenticate]
        }
        ,async (req, res) => {

        const relation = await models.Friends.findOne({ where :
            {AccountID:req.user.id, status:'friends'}})

        res.send(relation)
    })

    fastify.get('/blocked',
        {
            onRequest: [fastify.authenticate]
        }
        ,async (req, res) => {

        const relation = await models.Friends.findOne({ where :
            {AccountID:req.user.id, status:'blocked'}})

        res.send(relation)
    })


    done()
}

export default createFriend