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

fastify.register(import ('@fastify/swagger'))
fastify.register(import ('@fastify/swagger-ui'), {routePrefix: '/docs',})
fastify.register(import ('./routes/register.js'))
fastify.register(import ('./routes/login.js'))
fastify.register(import ('./routes/login_verify.js'))
fastify.register(import ('./routes/protected.js'))
fastify.register(import ('./routes/login_42.js'))
fastify.register(import ('./routes/login_google.js'))

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