import URServices from '../services/relationsS.js'
import pool from '../config/pooling.js'

export default 
{
    async SendReqC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot send a req to yoursef')

            await URServices.SendReq(req.user.id, req.query['id'])
            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async AcceptReqC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot accept yoursef')

            await URServices.AcceptReq(req.user.id, req.query['id'])
            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async DenyReqC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot deny your own req')

            await URServices.DenyReq(req.user.id, req.query['id'])
            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async cancelMyReqC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot cancel your own req')

            const rowCount = await URServices.cancelMyReqS(req.user.id, req.query['id'])

            if (!rowCount)
                throw new Error('The relation does not exist')
            
            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async blockUserC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot cancel your own req')

            await URServices.blockUser(req.user.id, req.query['id'])

            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async unblockUserC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot cancel your own req')

            const rowCount = await URServices.unblockUser(req.user.id, req.query['id'])

            if (!rowCount)
                throw new Error('The relation does not exist')
            
            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async unfriendC(req, res){
        try
        {
            await pool.query('BEGIN')
            if (req.user.id == req.query['id'])
                throw new Error('You cannot unfriend yoursef')

            const rowCount = await URServices.unfriendReq(req.user.id, req.query['id'])
            
            if (!rowCount)
                throw new Error('The relation does not exist')
            
            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async AllRelationsC(req, res){
        try
        {
            await pool.query('BEGIN')
            const relations =  await URServices.AllRelations(req.user.id)
            await pool.query('COMMIT')
            res.status(200).send(relations)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async friendShipCheckC(req, res)
    {
        try
        {
            await pool.query('BEGIN')
            
            const { id } = req.query

            const relationCheck =  await URServices.friendShipCheckS(req.user.id, id)
            
            await pool.query('COMMIT')
            res.status(200).send({'Friendship': relationCheck})
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error: err.message})
        }
    }
}