import Account from "../../auth-service/models/Account.js"
import {models} from "../config/db.js"
import { FriendsMod } from "../models/Friends.js"

const createFriend = (fastify, options, done) => {

    fastify.get('/list', async (req, res) => {
        res.send(await models.Account.findAll())
    })

    fastify.get('/send-req', async (req, res) => {
        const user1 = await models.Account.findOne({where:{username:'admin2'}})
        // console.log(user1)
        const user2 = await models.Account.findOne({where:{username:'admin3'}})
        // console.log(user2)

        // await models.Friends.create({AccountID:user1.id, FriendID:user2.id})
        res.send(await models.Friends.findAll())
    })

    done()
}

export default createFriend