import { DataTypes } from "sequelize"
import sequelize from '../db.js'
import path from 'path'

const DEFAULT_BACKGROUND = path.join(process.cwd(), 'media', 'avatar', 'default_background.jpg')
const DEFAULT_AVATAR = path.join(process.cwd(), 'media', 'avatar', 'default_avatar.jpg')

const Account = sequelize.define(
    'Account',
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING, unique: true, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        first_name: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        last_name: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        password: { type: DataTypes.STRING, allowNull: true },
        is_oauth: { type: DataTypes.BOOLEAN, defaultValue: false },
        is_otp_active: { type: DataTypes.BOOLEAN, defaultValue: false },
        is_otp_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
        is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
        level: { type: DataTypes.INTEGER, defaultValue: 1 },
        rank: { type: DataTypes.INTEGER, defaultValue: 1 },
        exp: { type: DataTypes.INTEGER, defaultValue: 0 },
        budget : {type: DataTypes.INTEGER, defaultValue:100},
        bio: { type: DataTypes.STRING, allowNull:true, defaultValue: null},
        avatar: {type:DataTypes.STRING, allowNull:true, defaultValue:DEFAULT_AVATAR},
        background: {type:DataTypes.STRING, defaultValue:DEFAULT_BACKGROUND},
    },
    {
        freezeTableName: true,
    },
)

export default Account