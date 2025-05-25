import pool from '../config/pooling.js'

export default {
    async SendReq(accountID, otherID) {

        // const receiver = await models.Account.findByPk(otherID)
        const receiver = await pool.query('SELECT EXISTS(SELECT 1 FROM player WHERE id = $1);', [otherID])
        if (!receiver.rows[0].exists)
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

        // const relation = await models.Friends.findOne(
        //     { where :{ [Op.or] : [
        //         {SenderKEY:otherID, ReceiverKEY:accountID},
        //         {SenderKEY:accountID, ReceiverKEY:otherID}
        //     ] } } )
        console.log(accountID, otherID)
        const relation = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
            WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1))', [accountID, otherID])

        if (relation.rows[0].exists)
        {
            const err = new Error("The Current relation, does not allow sending new request")
            err.code = 400
            throw err
        }
        console.log(accountID, otherID)
            
        // await models.Friends.create({SenderKEY:accountID, ReceiverKEY:otherID})
        console.log('BFENDKSAJNJDKSAN')
        await pool.query('INSERT INTO friends(sender, receiver) VALUES($1, $2);', [accountID, otherID])
        console.log('748386483276447')
    },

    async AcceptReq(accountID, otherID) {

        // const sender = await models.Account.findByPk(otherID)
        const sender = await pool.query('SELECT EXISTS(SELECT 1 FROM player WHERE      \
            id = $1)', [otherID])
        if (!sender.rows[0].exists)
        {
            const err = Error('Account not found')
            err.code = 400
            throw err
        }

        // const relation = await models.Friends.findOne({ where :
        //     {SenderKEY:otherID, ReceiverKEY:accountID, status:'pending'}})

        const relation = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE    \
            sender = $1 AND receiver = $2 AND status = $3)', [otherID, accountID, 0])

        if (!relation.rows[0].exists)
        {
            const err = Error('The relation, does not exist')
            err.code = 400
            throw err
        }
            
        // await relation.update({status:'friends'})
        await pool.query('UPDATE friends SET status = 1     \
            WHERE sender = $1 AND receiver = $2', [otherID, accountID])

    },

    async DenyReq(accountID, otherID)
    {
        // const sender = await models.Account.findByPk(otherID)
        const sender = await pool.query('SELECT EXISTS(SELECT 1 FROM player    \
            WHERE id = $1', [otherID])

        if (!sender.rows[0].exists)
        {
            const err = Error('Account not found')
            err.code = 400
            throw err
        }

        // const relation = await models.Friends.findOne({ where :
        //     {SenderKEY:otherID, ReceiverKEY:accountID, status:'pending'}})

        const relation = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE    \
            sender = $1 AND receiver = $2 AND status = $3', [otherID, accountID, 0])

        if (!relation.rows[0].exists)
        {
            const err = Error('The relation, does not exist')
            err.code = 400
            throw err
        }

        // await relation.destroy()

        await pool.query('DELETE FROM friends WHERE     \
            sender = $1 AND receiver = $2 AND status = $3', [otherID, accountID, 0])

        // res.send(await models.Friends.findAll())
    },

    async ReceivedReq(accountID)
    {
        // const relation = await models.Friends.findAll({ where :
        //     {ReceiverKEY:accountID, status:'pending'}})

        const relation = await pool.query('SELECT sender FROM friends WHERE     \
            receiver = $1 AND status = $2', [accountID, 0])


        return (relation.rows)
    },

    async SentReq(accountID)
    {
        // const relation = await models.Friends.findAll({ where :
        //     {SenderKEY:accountID, status:'pending'}})

        const relation = await pool.query('SELECT receiver FROM friends     \
            WHERE sender = $1 AND status = $2', [accountID, 0])
        

        return (relation.rows)
    },

    async FriendList(accountID)
    {
        // const relation = await models.Friends.findAll({ where : 
        //     { [Op.or] :
        //         [
        //             {SenderKEY:accountID, status:'friends'},
        //             {ReceiverKEY:accountID, status:'friends'},
        //         ]
        //     }
        // })

        const relation = await pool.query('SELECT sender, receiver FROM friends     \
            WHERE (sender = $1 OR receiver = $2) AND status = $3', [accountID,accountID,  1])
        // console.log('dsajdasnkdnaskndskajndkasnd')
        return (relation.rows)
    },

    async BlackList(accountID)
    {
        // const relation = await models.Friends.findAll({ where : 
        //             {SenderKEY:accountID, status:'blocked'},
        // })

        const relation = await pool.query('SELECT receiver FROM friends     \
            WHERE sender = $1 AND status = $2', [accountID, -1])

        return (relation.rows)
    },

    async AllRelations(accountID)
    {
        const relations = {
            friends: await this.FriendList(accountID),
            blacklist: await this.BlackList(accountID),
            receivedReq: await this.ReceivedReq(accountID),
            sentReq: await this.SentReq(accountID)
        }
        return relations
    }
}