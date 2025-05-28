import storeS from '../services/storeS.js'

export default 
{
    async SendReqC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot send a req to yoursef')

            await URServices.SendReq(req.user.id, req.query['id'])
            res.status(200).send({Success:true, 'msg':'Req sent successfully'})
        }
        catch(err)
        {
            res.status(400).send({Success:false, Error:err.message})
        }
    },
}
