import { DataTypes } from "sequelize"
import sequelize from '../config/db.js'
import Account from "./Account.js"
import { FOREIGNKEYS } from "sequelize/lib/query-types"

const Friend = sequelize.define(
    'Friend',
    {
        status:
        {
            type: DataTypes.ENUM('friends', 'blocked', 'pending'),
            defaultValue: 'pending',
            allowNull: false,
        },
    },
    {
        freezeTableName:true,
    },

    Account.belongsToMany(Account, {through : Friend}, {ForeignKey:'Sender'}),
    Account.belongsToMany(Account, {through : Friend}, {ForeignKey:'Receiver'})
)