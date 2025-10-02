import {gameStatsS, getGameHistoryS, getChartStatsS} from "../services/gameStatsS.js"
import pool from '../config/pooling.js'

export async function gameStatsC (req, res) {
    try
    {        
        await pool.query('BEGIN')
        let {limit, offset} = req.query
        
        if (!limit || limit < 0 || limit > 100)
            limit = 4
        
        if (!offset || offset < 0)
            offset = 0

        const data = await gameStatsS(req.user.id, limit, offset)

        await pool.query('COMMIT')

        return res.status(200).send(data)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        res.status(400).send({Error: 'Operation Failed'})
    }
}

export async function getGameHistoryC (req, res) {
    try
    {        
        await pool.query('BEGIN')
        let {limit, offset, id} = req.query
        
        if (!limit || limit <= 0 || limit > 100)
            limit = 4
    
        if (!id)
            id = req.user.id

        const data = await getGameHistoryS(id, limit, offset)

        await pool.query('COMMIT')

        return res.status(200).send(data)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        res.status(400).send({Error: 'Operation Failed'})
    }
}

export async function getChartStatsC (req, res) {
    try
    {        
        await pool.query('BEGIN')

        let interval = 0;
        if (req.query.interval)
            interval = 1

        const data = await getChartStatsS(req.user.id, interval)

        await pool.query('COMMIT')

        return res.status(200).send(data)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        res.status(400).send({Error: 'Operation Failed'})
    }
}