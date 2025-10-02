import { Client } from 'pg'
import fs from 'fs'

const setupdb = async () => {
    try
    {
        const client2 = new Client({
            user: 'chat',
            host: 'postgres_db',
            database: 'chat_db',
            password: process.env.CHAT_DB_PASSWORD,
            port: 5432
        });

        await client2.connect()
    
        const query = fs.readFileSync('./models/chatTables.sql', 'utf-8')
        await client2.query(query)
        await client2.end()
        console.log('[DB] init done')
    }
    catch(err)
    {
        console.log(`[CHAT DB] ${err}`)
    }
}

export default setupdb