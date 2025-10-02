import pool from '../config/pooling.js'
import kafkaProd from '../config/kafkaProd.js'

export default {
    async buyS(accoundID, item_id, item_type, table_name) {
        const check = await pool.query(`                                
            WITH item_price AS 
                (SELECT price from ${table_name} WHERE id = $1),        
            
            user_budget AS
                (SELECT budget FROM player WHERE id = $2),  

            legit_trans AS 
                (SELECT                          
                    ((SELECT price from item_price) <= (SELECT budget FROM user_budget)) AS has_budget),
            
            budget_update AS (
                UPDATE player SET budget = budget - (SELECT price from item_price) 
                WHERE
                    id = $2 AND
                    (SELECT has_budget FROM legit_trans)
                RETURNING (SELECT has_budget FROM legit_trans) AS success)

            INSERT INTO inventory(user_id, item_id, item_type) SELECT $2, $1, $3
            WHERE (SELECT has_budget FROM legit_trans) = true
            RETURNING (SELECT success FROM budget_update)
            `, [item_id, accoundID, item_type])

        return check.rowCount > 0 && check.rows[0].success
    },

    async list_inventoryS(accoundID) {
        const list = await pool.query('SELECT item_id, item_type, is_equipped FROM inventory \
            WHERE user_id = $1', [accoundID])
        const budgetQuery = await pool.query('SELECT budget FROM player WHERE id = $1', [accoundID])
        const budget = budgetQuery.rows.length > 0 ? budgetQuery.rows[0].budget : 0        
        return {
            inventory: list.rows,
            coins: budget
        }
    },

    async equipS(accoundID, item_id, item_type) {
        const check = await pool.query('SELECT EXISTS(SELECT 1 FROM \
            inventory WHERE user_id = $1 AND item_id = $2 \
            AND item_type = $3)', [accoundID, item_id, item_type])

            
        if (!check.rows[0].exists)
            throw new Error('You do not have the item')
            
        await pool.query('UPDATE inventory SET is_equipped = false \
            WHERE item_type = $1 AND user_id = $2', [item_type, accoundID])

        let table;
        if (item_type == 1)
            table = 'avatars'
        else if (item_type == 2)
            table = 'backgrounds'
        else
            throw new Error('Invalid item type to equip')

        const value = await pool.query(`SELECT image_path FROM ${table} WHERE id = $1`, [item_id])
        const column = table.substring(0, table.length - 1)
        await pool.query(`UPDATE player \
            SET ${column} = $1 WHERE id = $2`, [value.rows[0].image_path, accoundID])

        await pool.query('UPDATE inventory SET is_equipped = true \
            WHERE item_type = $1 AND item_id = $2 AND user_id = $3 ', [item_type, item_id, accoundID])

        if (item_type == 1)
        {
            await kafkaProd('updateAvatar', {
                id: accoundID,
                value: value.rows[0].image_path
            })
        }
    },

    async listStoreAvatarsS()
    {
        const data = await pool.query('SELECT id, price, image_path FROM avatars')
        return data.rows
    },

    async listStoreBgsS()
    {
        const data = await pool.query('SELECT id, price, image_path FROM backgrounds')
        return data.rows
    },
}