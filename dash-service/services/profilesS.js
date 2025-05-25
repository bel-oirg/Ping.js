import pool from "../config/pooling.js"
import URS from './URS.js'

const relation_type = async (id, req_id) => 
{
    const fr_or_blocked = await pool.query('SELECT status FROM friends WHERE \
        (sender = $1 AND receiver = $2);', [id, req_id])

    if (fr_or_blocked.rows.length)
    {
        const status = fr_or_blocked.rows[0]
        if (!status)
            return 2 //he sent me a fr
        if (status == 1)
            return 1 //we re friends
        return -1 //he blocked me
    }

    const fr_or_blocked2 = await pool.query('SELECT status FROM friends WHERE \
        (sender = $1 AND receiver = $2);', [req_id, id])

    if (fr_or_blocked2.rows.length)
    {
        const status = fr_or_blocked2.rows[0]
        if (!status)
            return 3 //i sent him a fr req
        if (status == 1)
            return 1 //we re friends
        return -2 //i blocked him
    }
    return 0
}

const display_profile = async (id, req_id) => {
    let user_data = await pool.query('SELECT id, username, first_name, \
            last_name, avatar, background, bio, is_online, is_oauth, rank, level \
            FROM player WHERE id = $1;', [id])
    console.log('user_data')
    if (!user_data.rows.length)
    {
        const err = new Error('User does not exist')
        err.code = 400
        throw err
    }
    user_data = user_data.rows[0]
    console.log('user_data')

    const rank_data = await pool.query('SELECT name, min_experience, max_experience, \
        reward, icon_path FROM ranks WHERE id = $1', [user_data.rank])
    console.log(rank_data)

    const level_data = await pool.query('SELECT id, min_experience, max_experience, \
        reward FROM levels WHERE id = $1', [user_data.level])
    console.log(id)
    console.log(req_id)
    
    return {
        "User": user_data,
        "Level": level_data.rows[0],
        "Rank": rank_data.rows[0],
        "Friends": await URS.FriendList(id),
        "is_self": id == req_id,
        "Friendship": await relation_type(id, req_id)
    }
}

export default display_profile
