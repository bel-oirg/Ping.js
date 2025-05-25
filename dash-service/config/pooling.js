import { Pool } from "pg"

const pool = new Pool({
    user: 'buddha',
    host: 'localhost',
    database: process.env.db_name,
    password: 'buddha',
    port: 5999
  });

export default pool
