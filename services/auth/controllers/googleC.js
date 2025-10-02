import googleS from '../services/googleS.js'
import pool from '../config/pooling.js'

const googleC = (fastify) => async(req, res) => {
    try
    {
        await pool.query('BEGIN')

        const code = req.query['code']

        const result = await googleS(fastify.jwt, code)
        await pool.query('COMMIT')

        if (typeof result === 'string') {
            res.status(200).send({token: result})
        } else if (result && result.otp_token) {
            res.status(200).send({otp_token: result.otp_token})
        } else {
            throw new Error('Invalid authentication response')
        }
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(400).send({Error: 'Operation Failed'})
    }
}

export default googleC