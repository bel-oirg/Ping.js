import { Pool } from "pg"

const pool = new Pool({
    user: 'buddha',
    host: 'localhost',
    database: 'mydb',
    password: 'buddha',
    port: 5999
  });

  export default pool
