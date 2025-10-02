import { Pool } from "pg"

const pool = new Pool({
      user: 'dash',
      host: 'postgres_db',
      database: 'dash_db',
      password: process.env.DASH_DB_PASSWORD,
      port: 5432
  });

export default pool
