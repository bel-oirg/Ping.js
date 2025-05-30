import changePassS from '../services/passwordS.js'

const changePassC = (fastify) => async(req, res) => {
    try
    {
        const {old_pass, new_pass} = req.body

        const TOKEN = req.headers.authorization.slice(7)
        const accountID = fastify.jwt.decode(TOKEN)
        
        await changePassS(accountID.id, old_pass, new_pass)

        res.status(200).send({Success: 'true'})
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default changePassC