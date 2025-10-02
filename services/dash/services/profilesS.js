import pool from "../config/pooling.js"
import URS from './relationsS.js'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import { pipeline } from 'node:stream/promises'
import kafkaProd from '../config/kafkaProd.js'

const status_types = {
    HE_SENT: 3,
    HE_FR: 2,
    HE_BLK: 1,

    I_SENT: -3,
    I_FR: -2,
    I_BLK: -1
}

const relation_type = async (id, req_id) => //req_id -> token_id
{
    const fr_or_blocked = await pool.query('SELECT status FROM friends WHERE \
        (sender = $1 AND receiver = $2);', [id, req_id])

    if (fr_or_blocked.rowCount)
    {
        const status = fr_or_blocked.rows[0].status
        if (!status)
            return status_types.HE_SENT //he sent me a fr
        if (status == 1)
            return status_types.HE_FR //we re friends
        return status_types.HE_BLK //he blocked me
    }

    const fr_or_blocked2 = await pool.query('SELECT status FROM friends WHERE \
        sender = $1 AND receiver = $2;', [req_id, id])

    if (fr_or_blocked2.rowCount)
    {
        const status = fr_or_blocked2.rows[0].status
        if (!status)
            return status_types.I_SENT //i sent him a fr req
        if (status == 1)
            return status_types.I_FR //we re friends
        return status_types.I_BLK //i blocked him
    }
    return 0
}

export default {

    async display_profile(id, req_id) { //req_id -> token id

        let user_data = await pool.query('SELECT id, username, email, first_name, \
                last_name, avatar, background, is_oauth, is_otp, exp, rank, level \
                FROM player WHERE id = $1;', [id])
        
        if (!user_data.rows.length)
            throw new Error('User does not exist')

        user_data = user_data.rows[0]
        const rank_data = await pool.query('SELECT name, min_exp, max_exp, \
            reward, icon_path FROM ranks WHERE id = $1', [user_data.rank])

        const level_data = await pool.query('SELECT id, min_exp, max_exp, \
            reward FROM levels WHERE id = $1', [user_data.level])

        const relation = await relation_type(id, req_id)

        let friends = await URS.FriendList(id)
        
        const fr_list = friends.map((fr) => {
            if (fr.receiver == id)
                return fr.sender
            return fr.receiver
        })
        return {
            "User": user_data,
            "Level": level_data.rows[0],
            "Rank": rank_data.rows[0],
            "Friends": fr_list,
            "is_self": id == req_id,
            "Friendship": relation
        }
    },


    async searchS(username)
    {
        const res = await pool.query("SELECT id, username, avatar FROM player WHERE \
            username ILIKE $1 LIMIT 5;", [`%${username}%`])
        return res.rows
    },

    async changePassS(accountID, TOKEN, old_pass, new_pass)
    {  
        check_oauth = await pool.query('SELECT is_oauth FROM player WHERE id = $1', [accountID])
        if (check_oauth.rows[0].is_oauth)
            throw new Error('Oauth user cannot change the password')
        await axios.post(process.env.AUTH_PCHANGE, 
            { old_pass:old_pass, new_pass:new_pass },
            { headers: { Authorization: TOKEN } }
        )
    },

    async editS(accountID, first_name, last_name)
    {
        if (first_name.length >= 30 || last_name.length >= 30)
            throw new Error('First or last name too long')
        
        await pool.query('UPDATE player SET         \
            first_name = COALESCE($2, first_name),  \
            last_name = COALESCE($3, last_name)     \
            WHERE id = $1;', [accountID, first_name, last_name])
    },

    async resetCliTokenS(accountID)
    {
        const token = jwt.sign({ id: accountID }, process.env.JWT_SECRET_CLI, { expiresIn: '30d' })
        await pool.query('UPDATE player SET \
            clitoken = $2 WHERE id = $1', [accountID, token])
        return token
    },

    async getCliTokenS(accountID)
    {
        const res = await pool.query('SELECT clitoken FROM player WHERE id = $1', [accountID])
        if (!res.rowCount)
            throw new Error('User does not exist')
        return res.rows[0].clitoken
    },

    async verifyCliTokenS(jwtfastify, token)
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_CLI)
        if (!decoded.id)
            throw new Error('Invalid token')

        const user_data = await pool.query('SELECT clitoken FROM player WHERE id = $1', [decoded.id])
        
        if (!user_data.rowCount)
            throw new Error('User does not exist')

        if (user_data.rows[0].clitoken != token)
            throw new Error('Invalid token')

        return jwtfastify.sign({id:decoded.id})
    },

    async updateAvatarS(data, accountID)
    {
        let PATH = '/dash/media/avatarUpload/'

        fs.unlink(`${PATH}${accountID}.png`, (err) => {
            if (err && err.code != 'ENOENT') {
                console.error('Error deleting file:', err)
            }
        })

        if (data.mimetype == 'image/png')
            PATH += `${accountID}.png`
        else
            throw new Error('Invalid image format')

        await pipeline(data.file, fs.createWriteStream(PATH))
        await pool.query('UPDATE player SET avatar = $1 WHERE id = $2', [PATH, accountID])
        await pool.query('UPDATE inventory SET is_equipped = false WHERE user_id = $1', [accountID])
        await kafkaProd('updateAvatar', {
            id: accountID,
            value: PATH
        })
    }
}
