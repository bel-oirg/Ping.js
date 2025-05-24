import { Client } from 'pg'

const setupdb = async () => {

    const db_name = process.env.DB_ENV
    if (!db_name)
    {
        console.log('[-] DB_ENV is not set')
        process.exit(1)
    }

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
        const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [db_name])
        if (!res.rowCount)
        {
            await client.query(`CREATE DATABASE "${db_name}";`) //FIX POSSIBLE SQL INJECTION
            console.log(`${process.env.DB_ENV} CREATED`)
        }
        await client.end()
    }
    catch(err)
    {
        console.log(err)
        process.exit(1)
    }
}

export default setupdb