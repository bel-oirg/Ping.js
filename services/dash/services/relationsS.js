import pool from '../config/pooling.js'
import kafkaProd from "../config/kafkaProd.js"

const idToMiniData = async(accountID, relationrows) => {
    const fr_list = await Promise.all(relationrows.map(async (fr) => {

        const fr_id = fr.receiver == accountID ? fr.sender : fr.receiver

        const data = await pool.query('SELECT first_name, last_name, username, avatar \
            FROM player WHERE id = $1', [fr_id])
        
        if (!data.rowCount) return {}

        return {id: fr_id,
            username: data.rows[0].username,
            first_name: data.rows[0].first_name,
            last_name: data.rows[0].last_name,
            avatar: data.rows[0].avatar,
            sender: fr.sender,
            receiver: fr.receiver
        }
    }))
    return fr_list
}



export default {
    async SendReq(accountID, otherID) {

        const receiver = await pool.query('SELECT username, avatar FROM player WHERE id = $1;', [otherID])
        if (!receiver.rowCount)
            throw new Error("Account not found")

        const sender = await pool.query('SELECT username, avatar FROM player WHERE id = $1;', [accountID])
        if (!sender.rowCount)
            throw new Error("Sender account not found")

        const relation = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
            WHERE (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1))', [accountID, otherID])

        if (relation.rows[0].exists)
            throw new Error("The Current relation, does not allow sending new request")
            
        await pool.query('INSERT INTO friends(sender, receiver) VALUES($1, $2);', [accountID, otherID])
        await kafkaProd('newRelation', {
            sender: accountID,
            receiver: otherID,
            senderUsername: sender.rows[0].username,
            senderAvatar: sender.rows[0].avatar,
            receiverUsername: receiver.rows[0].username,
            receiverAvatar: receiver.rows[0].avatar,
            requestType: 1,
            created_at: new Date()
        })
    },

    async AcceptReq(accountID, otherID) {

        const sender = await pool.query('SELECT username, avatar FROM player WHERE id = $1', [otherID])
        if (!sender.rowCount)
            throw new Error('Account not found')
            
        const receiver = await pool.query('SELECT username, avatar FROM player WHERE id = $1', [accountID])
        if (!receiver.rowCount)
            throw new Error('Receiver account not found')

        const relation = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE    \
            sender = $1 AND receiver = $2 AND status = $3)', [otherID, accountID, 0])

        if (!relation.rows[0].exists)
            throw new Error('The relation does not exist')
            
        await pool.query('UPDATE friends SET status = 1     \
            WHERE sender = $1 AND receiver = $2', [otherID, accountID])

        await kafkaProd('newRelation', {
            sender: accountID,
            receiver: otherID,
            senderUsername: receiver.rows[0].username,
            senderAvatar: receiver.rows[0].avatar,
            receiverUsername: sender.rows[0].username,
            receiverAvatar: sender.rows[0].avatar,
            requestType: 2,
            created_at: new Date()
        })
    },

    async DenyReq(accountID, otherID)
    {
        const sender = await pool.query('SELECT EXISTS(SELECT 1 FROM player    \
            WHERE id = $1)', [otherID])

        if (!sender.rows[0].exists)
            throw Error('Account not found')

        const relation = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE    \
            sender = $1 AND receiver = $2 AND status = $3)', [otherID, accountID, 0])

        if (!relation.rows[0].exists)
            throw Error('The relation does not exist')

        await pool.query('DELETE FROM friends WHERE     \
            sender = $1 AND receiver = $2 AND status = $3', [otherID, accountID, 0])
        await kafkaProd('newRelation', {
            sender: accountID,
            receiver: otherID,
            requestType: 3,
            created_at: new Date()
        })
    },

    async cancelMyReqS(accountID, otherID)
    {
        const q = await pool.query('DELETE FROM friends WHERE     \
            sender = $1 AND receiver = $2 AND status = $3', [accountID, otherID, 0])

        if (q.rowCount > 0)
        {
            await kafkaProd('newRelation', {
                sender: accountID,
                receiver: otherID,
                requestType: 4,
                created_at: new Date()
            })
        }
        return q.rowCount
    },

    async blockUser(accountID, otherID)
    {
        await pool.query('DELETE FROM friends WHERE \
            (sender = $1 AND receiver = $2) OR (sender = $2 AND receiver = $1) \
            ', [accountID, otherID])


        await pool.query('INSERT INTO friends(sender, receiver, status) \
            VALUES($1, $2, $3);', [accountID, otherID, -1])
                
        await kafkaProd('newRelation', {
            sender: accountID,
            receiver: otherID,
            requestType: -1,
            created_at: new Date()
        })
    },


    async unblockUser(accountID, otherID)
    {
        const query = await pool.query('DELETE FROM friends WHERE  \
            (sender = $1 AND receiver = $2 AND status = $3)', [accountID, otherID, -1])
        
        if (query.rowCount > 0)
        {
            await kafkaProd('newRelation', {
                sender: accountID,
                receiver: otherID,
                requestType: -2,
                created_at: new Date()
            })
        }

        return query.rowCount
    },
    

    async unfriendReq(accountID, otherID)
    {
        const relation = await pool.query('DELETE FROM friends WHERE  \
            ((sender = $1 AND receiver = $2 ) OR (sender = $2 AND receiver = $1)) AND status = 1', [accountID, otherID])

        if (relation.rowCount > 0)
        {
            await kafkaProd('newRelation', {
                sender: accountID,
                receiver: otherID,
                requestType: -3, // i need this in chat service to remove the id from the list of friends
                created_at: new Date()
            })
        }
    
        return relation.rowCount
    },

    async ReceivedReq(accountID)
    {
        const relation = await pool.query('SELECT sender, receiver FROM friends WHERE     \
            receiver = $1 AND status = $2', [accountID, 0])

        return (await idToMiniData(accountID, relation.rows))
    },

    async SentReq(accountID)
    {
        const relation = await pool.query('SELECT sender, receiver FROM friends     \
            WHERE sender = $1 AND status = $2', [accountID, 0])
        
        return (await idToMiniData(accountID, relation.rows))
    },

    async FriendListID(accountID)
    {
        const relation = await pool.query('SELECT sender, receiver FROM friends     \
            WHERE (sender = $1 OR receiver = $1) AND status = $2', [accountID, 1])

        const fr_list = relation.rows.map((fr) => {
            if (fr.receiver == accountID)
                return fr.sender
            return fr.receiver
        })
        return (fr_list)
    },

    async FriendList(accountID)
    {
        const relation = await pool.query('SELECT sender, receiver FROM friends     \
            WHERE (sender = $1 OR receiver = $1) AND status = $2', [accountID, 1])

        return (await idToMiniData(accountID, relation.rows))
    },

    async BlackList(accountID)
    {
        const relation = await pool.query('SELECT sender, receiver FROM friends     \
            WHERE sender = $1 AND status = $2', [accountID, -1])

        return (await idToMiniData(accountID, relation.rows))
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
    },

    async friendShipCheckS(accountID, otherID)
    {
        const check = await pool.query('SELECT 1 FROM friends WHERE ((sender = $1 AND receiver = $2) \
                OR (sender = $2 AND receiver = $1)) AND status = 1', [accountID, otherID])
        return check.rowCount == 1 ? true : false
    }
}