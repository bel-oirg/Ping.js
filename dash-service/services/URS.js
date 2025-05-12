import {models} from '../config/db.js'
import { Op } from 'sequelize';

export default {
    async SendReq(accountID, otherID) {

        const receiver = await models.Account.findByPk(otherID)
        if (!receiver)
        {
            const err = new Error("Account not found")
            err.code = 400
            throw err
        }

        if (otherID == accountID)
        {
            const err = new Error("You can not send req to yourself")
            err.code = 400
            throw err
        }

        const relation = await models.Friends.findOne(
            { where :{ [Op.or] : [
                {SenderKEY:otherID, ReceiverKEY:accountID},
                {SenderKEY:accountID, ReceiverKEY:otherID}
            ] } } )

        if (relation)
        {
            const err = new Error("The Current relation, does not allow sending new request")
            err.code = 400
            throw err
        }
            
        await models.Friends.create({SenderKEY:accountID, ReceiverKEY:otherID})
    },

    async AcceptReq(accountID, otherID) {

        const sender = await models.Account.findByPk(otherID)
        if (!sender)
        {
            const err = Error('Account not found')
            err.code = 400
            throw err
        }

        const relation = await models.Friends.findOne({ where :
            {SenderKEY:otherID, ReceiverKEY:accountID, status:'pending'}})

        if (!relation)
        {
            const err = Error('The relation, does not exist')
            err.code = 400
            throw err
        }
            
        await relation.update({status:'friends'})

    },

    async DenyReq(accountID, otherID)
    {
        const sender = await models.Account.findByPk(otherID)
        if (!sender)
        {
            const err = Error('Account not found')
            err.code = 400
            throw err
        }

        const relation = await models.Friends.findOne({ where :
            {SenderKEY:otherID, ReceiverKEY:accountID, status:'pending'}})

        if (!relation)
        {
            const err = Error('The relation, does not exist')
            err.code = 400
            throw err
        }

        await relation.destroy()

        res.send(await models.Friends.findAll())
    },

    async ReceivedReq(accountID)
    {
        const relation = await models.Friends.findAll({ where :
            {ReceiverKEY:accountID, status:'pending'}})

        return (relation)
    },

    async SentReq(accountID)
    {
        const relation = await models.Friends.findAll({ where :
            {SenderKEY:accountID, status:'pending'}})

        return (relation)
    },

    async FriendList(accountID)
    {
        const relation = await models.Friends.findAll({ where : 
            { [Op.or] :
                [
                    {SenderKEY:accountID, status:'friends'},
                    {ReceiverKEY:accountID, status:'friends'},
                ]
            }
        })

        return (relation)
    },

    async BlackList(accountID)
    {
        const relation = await models.Friends.findAll({ where : 
                    {SenderKEY:accountID, status:'blocked'},
        })

        return (relation)
    },

    async AllRelations(accountID)
    {
        const relations = {
            friends: await this.FriendList(accountID),
            blacklist: await this.BlackList(accountID),
            receivedReq: await this.ReceivedReq(accountID),
            sentReq: await this.SentReq(accountID)
        }
        console.log(accountID)
        return relations
    }
}