import twofaS from '../services/twofaS.auth.js'
import pool from '../config/pooling.js'

const twofaC = (fastify) =>  async(req, res) => {
    try
    {
        await pool.query('BEGIN')

        const {code, otp_token} = req.body
        const token = await twofaS(fastify.jwt, code, otp_token)
        await pool.query('COMMIT')

        res.status(200).send({token: token})
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(401).send({Error: 'Operation Failed'})
    }
}

export default twofaC