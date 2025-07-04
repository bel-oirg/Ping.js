import pool from "../config/pooling.js"


const convS = async (accountID) => {

    const msg_data = await pool.query("WITH conv AS \
        (SELECT *, GREATEST(user1, user2) AS u1, LEAST(user1, user2) AS u2 \
        FROM msg WHERE user1 = $1 OR user2 = $1), \
        last_msg AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY u1, u2 ORDER BY created_at DESC) FROM conv) \
         SELECT user1, user2, sender, data, created_at FROM last_msg WHERE row_number = 1;", [accountID])

    return msg_data.rows
}

export default convS