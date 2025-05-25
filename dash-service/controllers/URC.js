import URServices from '../services/URS.js'

export default 
{
    async SendReqC(req, res){
        try
        {
            await URServices.SendReq(req.user.id, req.query['id'])
            res.status(200).send({Success:true, 'msg':'Req sent successfully'})
        }
        catch(err)
        {
            res.status(err.code).send({Success:false, Error:err.message})
        }
    },

    async AcceptReqC(req, res){
        try
        {
            await URServices.AcceptReq(req.user.id, req.query['id'])
            res.status(200).send({Success:true, 'msg':'Req Accepted successfully'})
        }
        catch(err)
        {
            res.status(err.code).send({Success:false, Error:err.message})
        }
    },

    async DenyReqC(req, res){
        try
        {
            await URServices.DenyReq(req.user.id, req.query['id'])
            res.status(200).send({Success:true, 'msg':'Req Refused successfully'})
        }
        catch(err)
        {
            res.status(err.code).send({Success:false, Error:err.message})
        }
    },

    async AllRelationsC(req, res){
        try
        {
            console.log(req.user.id)
            const relations =  await URServices.AllRelations(req.user.id)
            res.status(200).send(relations)
        }
        catch(err)
        {
            res.status(err.code).send({Success:false, Error:err.message})
        }
    },
}