import { Client } from 'pg'
import fs from 'fs'

const setupdb = async () => {
	try {
		const client2 = new Client({
			user: 'dash',
			host: 'postgres_db',
			database: 'dash_db',
			password: process.env.DASH_DB_PASSWORD,
			port: 5432
		});

		await client2.connect()

		let query = fs.readFileSync('./models/dashTables.sql', 'utf-8')
		query += fs.readFileSync('./models/levels.sql', 'utf-8')
		query += fs.readFileSync('./models/ranks.sql', 'utf-8')
		query += fs.readFileSync('./models/store.sql', 'utf-8')
		await client2.query(query)
		await client2.end()
		console.log('[DB-DASH] init done')
	}
	catch (err) {
		console.log(`[DB-DASH] ${err}`)
	}
}

export default setupdb