import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {

    await setupdb(process.env.db_name)

    const fastify = Fastify({
        logger: {
            transport: { target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname,reqId',
                messageFormat: '{msg} {req.method} {req.url}',
                levelFirst: true, colorize: true,singleLine: true,}}}})

    fastify.register(import ('./routes/login_verify.js'))
    fastify.register(import ('./routes/URR.js'))
    fastify.register(import ('./routes/profilesR.js'))

    return fastify
}

export default appBuilder