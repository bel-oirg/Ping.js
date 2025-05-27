import pool from "../config/pooling"

export default {
    async add_achievements(accountID, achievID) {

        const check = await pool.query('SELECT EXISTS(SELECT 1 FROM user_achiev WHERE \
            user_id = $1 AND achievement_id = $2;', [accountID, achievID])
        if (check.rows[0].exists)
            throw new Error('Achivement already exists')

        await pool.query('INSERT INTO user_achiv(user_id, achievement_id) \
            VALUES($1, $2);', [accountID. achievID])
    },

    async update_achievements(accountID, achievID, parts) {
        await pool.query('UPDATE user_achiev SET parts = $1 \
            WHERE user_id = $2 AND achievement_id = $3;', [parts, accountID, achievID])
    },

    async list_achievements(accountID) {
        const all = await pool.query('SELECT achievement_id, parts, \
            FROM achievements WHERE user_id = $1;' [accountID])
    },

    async all_achievements() {
        const all = await pool.query('SELECT achievements.id, achievements.title, \
            achievements.description, achievements.coin_reward, achievements.parts, \
            achievements.icon_path FROM achievements RIGHT JOIN user_achiev \
            ON achievements.id = user_achiev.achievment_id;')

        return all.rows
    },
}