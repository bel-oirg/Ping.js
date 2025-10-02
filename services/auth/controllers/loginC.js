import loginS from '../services/loginS.js'
import pool from '../config/pooling.js'

const loginC = (fastify) => async(req, res) => {
    try
    {
        await pool.query('BEGIN')

        const {username, password} = req.body
        const token = await loginS.loginS(fastify.jwt, username, password)

        await pool.query('COMMIT')

        res.status(200).send(token)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        res.status(400).send({Error: 'Login failed.'})
    }
}

export default loginC