import { Sequelize } from "sequelize"
import {AccountMod} from '../models/Account.js'
import {FriendsMod} from '../models/Friends.js'


const sequelize = new Sequelize('postgres://buddha:buddha@localhost:5999/mydb')

export const models = {
    Account : AccountMod(sequelize, Sequelize),
    Friends : FriendsMod(sequelize, Sequelize),
}

Object.keys(models).forEach((key) => {
    if ('associate' in models[key])
    {
        models[key].associate(models)
    }
})

export default sequelize