import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {

    await setupdb(process.env.db_name)

    const fastify = Fastify({
        logger: {
            transport: { target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname,reqId',
            messageFormat: '{msg} {req.method} {req.url}',
            levelFirst: true, colorize: true, singleLine: true,}}}})

    fastify.register(import ('@fastify/jwt'),
    {secret: process.env.JWT_SECRET, sign: {expiresIn:'4h'}})

    fastify.addHook('onRequest', async (req) => { await req.jwtVerify() })

    fastify.register(import ('./routes/relationsR.js'))
    fastify.register(import ('./routes/profilesR.js'))

    return fastify
}

export default appBuilder