import { Client } from 'pg'
import fs from 'fs'

const setupdb = async () => {
    try
    {
        const clientForTable = new Client({
            user: 'auth',
            host: 'postgres_db',
            database: 'auth_db',
            password: process.env.AUTH_DB_PASSWORD,
            port: 5432
        });

        await clientForTable.connect()
    
        const query = fs.readFileSync('./models/initDB.sql', 'utf-8')
        await clientForTable.query(query)
        await clientForTable.end()
        console.log('[DB] init done')
    }
    catch(err)
    {
        console.log(`[AUTH DB] ${err}`)
    }
}

export default setupdb