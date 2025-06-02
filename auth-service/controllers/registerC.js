import registerS from "../services/registerS.js"

const RegisterC = async (req, res) =>
{
    try
    {
        const {username , email, password, repassword, first_name, last_name} = req.body
        await registerS(username , email, password, repassword, first_name, last_name)
        res.status(201)
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default RegisterC