import convS from '../services/convS.js'
import pool from '../config/pooling.js'

const convC = async (req, res) => {
    try
    {
        await pool.query('BEGIN')

        const otherID = req.query['id']
        const data = await convS(req.user.id, otherID)

        await pool.query('COMMIT')

        res.status(200).send(data)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(400).send({Error: 'Operation Failed'})
    }
}

export default convC