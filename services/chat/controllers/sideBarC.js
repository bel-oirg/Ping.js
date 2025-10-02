import sideBarS from '../services/sideBarS.js'
import pool from '../config/pooling.js'

const sideBarC = async (req, res) => {
    try
    {
        await pool.query('BEGIN')

        const data = await sideBarS(req.user.id)

        await pool.query('COMMIT')

        res.status(200).send(data)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        
        console.error('Error in sideBarC:', err.message, err.stack)
        
        res.status(400).send({Error: 'Operation Failed'})
    }
}

export default sideBarC