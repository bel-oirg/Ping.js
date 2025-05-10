import Fastify from 'fastify'
import sequelize from './config/db.js';

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


try
{
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('[DB] connection is good')
}
catch(err)
{
    console.error('[DB] Unable to connect to db :', err);
}


const start = async () => {
    try
    {
        fastify.listen({ port:3000 })
    }
    catch (err)
    {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()