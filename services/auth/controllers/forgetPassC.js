import forgetPassS from '../services/forgetPassS.js'
import pool from '../config/pooling.js'

export default {

    async send_mail(req, res) {
        try
        {
            await pool.query('BEGIN')
            const email = req.body['email']

            await forgetPassS.send_mailS(email)

            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')

            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async checkCodeC(req, res) {
        try
        {
            await pool.query('BEGIN')

            const {email, code} = req.body

            await forgetPassS.checkCodeS(email, code)
            await pool.query('COMMIT')

            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')

            res.status(400).send({Error: 'Operation Failed'})
        }
    },

    async forget_passC(req, res) {
        try
        {
            await pool.query('BEGIN')

            const {email, code, password, repassword} = req.body
            if (password != repassword)
                throw new Error('Passwords does not match')

            await forgetPassS.forget_passS(email, code, password)
            await pool.query('COMMIT')

            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')

            res.status(400).send({Error: 'Operation Failed'})
        }
    },
}