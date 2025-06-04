import pool from "../config/pooling"

const add_notif = async (accountID, otherID, notif_type) => {
    await pool.query('INSERT INTO notifs(sender, receiver, type) \
        VALUES($1, $2, $3);', [accountID, otherID, notif_type])
}

export default add_notif
