import { Pool } from "pg"

const pool = new Pool({
    user: 'buddha',
    host: 'localhost',
    database: process.env.DB_ENV,
    password: 'buddha',
    port: 5999
  });

export default pool
