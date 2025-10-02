import leaderboardS from "../services/leaderboardS.js"
import pool from '../config/pooling.js'

const twofaC = async (req, res) => {
    try
    {
        await pool.query('BEGIN')

        const data = await leaderboardS()
        
        await pool.query('COMMIT')

        res.status(200).send(data)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(400).send({Error: 'Operation Failed'})
    }
}

export default twofaC