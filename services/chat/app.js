import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {
    await setupdb()

    const fastify = Fastify({
        logger: {
            transport: { target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname,reqId',
                messageFormat: '{msg} {req.method} {req.url}',
                levelFirst: true, colorize: true,singleLine: true,}}}})

    fastify.register(import ('@fastify/swagger'))
    fastify.register(import ('@fastify/swagger-ui'), {routePrefix: '/docs',})


    fastify.register(import ('@fastify/jwt'),
    {secret: process.env.JWT_SECRET, sign: {expiresIn:'4h'}})


    fastify.addHook('onRequest', async (req) => { 
        if (req.url.startsWith('/docs')) {
            return
          }
        await req.jwtVerify() })


    fastify.register(import('@fastify/cors'), {
        origin: 'http://localhost:3000',
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    });

    fastify.register(import ('./utils/kafkaConsumer.js'))
    fastify.register(import ('./routes/convR.js'))
    fastify.register(import ('./routes/sideBarR.js'))
    // fastify.register(import ('./routes/sendMsgR.js'))
    return fastify
}

export default appBuilder