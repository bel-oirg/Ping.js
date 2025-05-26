import display_profile from "../services/profilesS.js"


const profilesC = async (req, res) => {
    try
    {
        console.log(req.user.id, req.query['id'])
        const data = await display_profile(req.query['id'], req.user.id)
        res.status(200).send(data)
    }
    catch(err)
    {
        res.status(err.code).send({Success:false, Error:err.message})
    }
}

export default profilesC