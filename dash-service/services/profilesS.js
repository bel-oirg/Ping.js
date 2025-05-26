import pool from "../config/pooling.js"
import URS from './URS.js'

const status_types = {
    HE_SENT: 3,
    HE_FR: 2,
    HE_BLK: 1,

    I_SENT: -3,
    I_FR: -2,
    I_BLK: -1
}

const relation_type = async (id, req_id) => 
{
    const fr_or_blocked = await pool.query('SELECT status FROM friends WHERE \
        (sender = $1 AND receiver = $2);', [id, req_id])

    if (fr_or_blocked.rows.length)
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

    if (fr_or_blocked2.rows.length)
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

const display_profile = async (id, req_id) => {
    let user_data = await pool.query('SELECT id, username, first_name, \
            last_name, avatar, background, bio, is_online, is_oauth, exp, rank, level \
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
    let fr_list = []
    
    if (relation)
    {
        if (relation > 0) // HE DID SOMETHING
            fr_list = friends.map((fr) => fr.sender)
        else
            fr_list = friends.map((fr) => fr.receiver)
    }

    return {
        "User": user_data,
        "Level": level_data.rows[0],
        "Rank": rank_data.rows[0],
        "Friends": fr_list,
        "is_self": id == req_id,
        "Friendship": relation
    }
}

export default display_profile
