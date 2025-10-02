import sendMsgS from '../services/sendMsgS.js'
import pool from '../config/pooling.js'

const sendMsgC = async (req, res) => {
    try
    {
        await pool.query('BEGIN')

        const {id, msg} = req.body
        await sendMsgS(req.user.id, id, msg)
        
        await pool.query('COMMIT')

        res.status(200)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(400).send({Error: 'Operation Failed'})
    }
}

export default sendMsgC