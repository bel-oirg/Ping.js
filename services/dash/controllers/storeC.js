import storeS from '../services/storeS.js'
import pool from '../config/pooling.js'

export default 
{
    async buyC(req, res){
        try
        {
            await pool.query('BEGIN')
            const {item_id, item_type} = req.body
            let table_name = ''

            if (item_type == 1)
                table_name = 'avatars' 
            else if (item_type == 2)
                table_name = 'backgrounds' 
            else if (item_type == 3)
                table_name = 'emotes_packs' 
            else
                throw new Error('Unknown type')


            const is_success = await storeS.buyS(req.user.id, item_id, item_type, table_name)
            if (!is_success)
                throw new Error('Operation Failed')

            await pool.query('COMMIT')

            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400)
        }
    },

    async list_inventoryC(req, res)
    {
        try
        {
            await pool.query('BEGIN')
            const listed = await storeS.list_inventoryS(req.user.id)
            await pool.query('COMMIT')
            
            res.status(200).send(listed)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async equipC(req, res)
    {
        try
        {
            await pool.query('BEGIN')
            
            const {item_id, item_type} = req.body
            await storeS.equipS(req.user.id, item_id, item_type)

            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error:err.message})
        }
    },

    async listStoreAvatarsC(req, res)
    {
        try
        {
            await pool.query('BEGIN')
            const listed = await storeS.listStoreAvatarsS()
            await pool.query('COMMIT')

            res.status(200).send(listed)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error:err.message})
        }
    },

    async listStoreBgsC(req, res)
    {
        try
        {
            await pool.query('BEGIN')
            const listed = await storeS.listStoreBgsS()
            await pool.query('COMMIT')

            res.status(200).send(listed)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error:err.message})
        }
    },

}
