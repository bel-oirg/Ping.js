import storeS from '../services/storeS.js'

export default 
{
    async buyC(req, res){
        try
        {
            const {item_id, item_type} = req.body
            if (item_type > 3 || item_type < 1)
                throw new Error('Unknown type')
            let table_name = ''

            if (item_type == 1) table_name = 'avatars' 
            if (item_type == 2) table_name = 'backgrounds' 
            if (item_type == 3) table_name = 'emotes_packs' 

            const is_success = await storeS.buyS(req.user.id, item_id, item_type, table_name)
            if (!is_success)
                throw new Error('Operation Failed')
            res.status(200).send({Success:true})
        }
        catch(err)
        {
            res.status(400).send({Success:false, Error:err.message})
        }
    },

    async list_inventoryC(req, res)
    {
        try
        {
            const listed = await storeS.list_inventoryS(req.user.id)
            res.status(200).send({Success:true, listed})
        }
        catch(err)
        {
            res.status(400).send({Success:false, Error:err.message})
        }
    }
}
