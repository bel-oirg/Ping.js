import changePassS from '../services/passwordS.js'

const changePassC = (fastify) => async(req, res) => {
    try
    {
        const {old_pass, new_pass} = req.body

        const TOKEN = req.headers.authorization.split(" ")
        const accountID = fastify.jwt.decode(TOKEN[1])
        
        await changePassS(accountID.id, old_pass, new_pass)

        res.status(200).send({Success: 'true'})
    }
    catch(err)
    {
        res.status(401).send({Success: 'false'})
    }
}

export default changePassC