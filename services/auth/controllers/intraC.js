import intraS from '../services/intraS.js'
import pool from '../config/pooling.js'

const intraC = (fastify) => async(req, res) => {
    try
    {
        await pool.query('BEGIN')

        const code = req.query['code']
        console.log(code);
        const result = await intraS(fastify.jwt, code)
        
        await pool.query('COMMIT')
        
        // Handle both token types
        const frontendUrl = 'http://blackholejs.art'
        let redirectUrl
        
        if (typeof result === 'string') {
            redirectUrl = `${frontendUrl}/login?token=${result}`
        } else if (result && result.otp_token) {
            redirectUrl = `${frontendUrl}/login?otp_token=${result.otp_token}`
        } else {
            throw new Error('Invalid authentication response')
        }
        
        res.redirect(redirectUrl)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        console.error(`Error in intraC: ${err}`)
        res.status(400).send({Error: 'Operation Failed'})
    }
}

export default intraC