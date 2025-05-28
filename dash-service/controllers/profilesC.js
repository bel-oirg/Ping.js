import dp from "../services/profilesS.js"


export default {

    async profilesC (req, res) {
        try
        {
            console.log(req.user.id, req.query['id'])
            const data = await dp.display_profile(req.query['id'], req.user.id)
            res.status(200).send(data)
        }
        catch(err)
        {
            res.status(400).send({Success:false, Error:err.message})
        }
    },

    async searchC(req, res){
        try
        {
            const data = await dp.searchS(req.query['q'])
            res.status(200).send(data)
        }
        catch(err)
        {
            res.status(400).send({Success:false, Error:err.message})
        }
    }
}
