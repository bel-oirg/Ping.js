import Fastify from 'fastify'
import pool from './config/db.js';
import fs from 'fs'
import setupdb from './config/setupDB.js';

await setupdb()

const fastify = Fastify({
    logger: {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname,reqId',
            messageFormat: '{msg} {req.method} {req.url}',
            levelFirst: true,
            colorize: true,
            singleLine: true,
          }
        }
    }
})

fastify.register(import ('@fastify/swagger'))
fastify.register(import ('@fastify/swagger-ui'), {routePrefix: '/docs',})
fastify.register(import ('./routes/registerR.js'))
fastify.register(import ('./routes/loginR.js'))
// fastify.register(import ('./routes/login_verify.js'))
// fastify.register(import ('./routes/protected.js'))
fastify.register(import ('./routes/intraR.js'))
fastify.register(import ('./routes/googleR.js'))


// checking db connection
await pool.connect()
.then(() => {
    console.log('[DB] connection is good')
})
.catch((err) => {
    console.error('[DB] Unable to connect to db :', err);
})

//loading the models
try{

    const query = fs.readFileSync('./models/Account.sql', 'utf-8')
    await pool.query(query)
}
catch(err)
{
    fastify.log.error(err)
    // await pool.end()
    process.exit(1) 
}

//run the server
const start = async () => {
    try
    {
        await fastify.listen({ port:3000 })
    }
    catch (err)
    {
        fastify.log.error(err)
        await pool.end()
        process.exit(1)
    }
}

start()

export default fastify