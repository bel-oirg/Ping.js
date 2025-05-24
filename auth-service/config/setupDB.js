import { Client } from 'pg'
import fs from 'fs'

const setupdb = async (db_name) => {

    try
    {
        const client = new Client({
            user: 'buddha',
            host: 'localhost',
            password: 'buddha',
            port: 5999,
            database: 'postgres'
        });

        await client.connect()
        const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1;', [db_name])
        if (!res.rowCount)
        {
            await client.query(`CREATE DATABASE ${db_name};`) //SQL INJ
            console.log(`${'mydb'} CREATED`)
        }
        await client.end()


        const client2 = new Client({
            user: 'buddha',
            host: 'localhost',
            password: 'buddha',
            port: 5999,
            database: 'mydb'
        });

        await client2.connect()
    
        const query = fs.readFileSync('./models/initDB.sql', 'utf-8')
        await client2.query(query)
        await client2.end()
        console.log('[DB] init done')
    }
    catch(err)
    {
        console.log(`[DB] ${err}`)
        process.exit(1)
    }
}

export default setupdb