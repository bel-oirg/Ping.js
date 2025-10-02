import pool from "../config/pooling.js"

const leaderboardS = async () => {

    let data = (await pool.query('SELECT id, username, avatar, rank, level, exp \
        FROM player ORDER BY exp DESC')).rows

    data = await Promise.all(data.map( async (elem) => {
        const details = await pool.query('SELECT min_exp, max_exp FROM levels WHERE id = $1', [elem.level])
        return {...elem, level_limits: details.rows[0]}
    }))
    return data
}

export default leaderboardS