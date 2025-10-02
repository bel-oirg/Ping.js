import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {

	await setupdb(process.env.db_name)

	const fastify = Fastify({

		logger: {
			level: 'info',
			options: {
				translateTime: 'HH:MM:ss Z',
				ignore: 'pid,hostname,reqId',
				messageFormat: '{message} {req.method} {req.url}',
				levelFirst: true,
				colorize: true,
			},
			serializers: {
				req: (req) => ({
					method: req.method,
					url: req.url,
					remoteAddress: req.ip,
				}),
				res: (res) => ({
					statusCode: res.statusCode
				})
			},
			formatters: {
				level(label) {
					return { level: label.toUpperCase() };
				},
				bindings() {
					return { logger: 'dash' };
				},
				log(object) {
					return {
						timestamp: new Date().toISOString(),
						message: object.msg,
						...object
					};
				}
			}
		},
		bodyLimit: 5000000,
	})

	fastify.register(import('@fastify/jwt'),
		{ secret: process.env.JWT_SECRET, sign: { expiresIn: '4h' } })


	fastify.register(import('@fastify/multipart'), {
		limits: {
			fieldNameSize: 80, 
			fieldSize: 100,
			fields: 1, 
			fileSize: 50000000,
			files: 1,
			headerPairs: 2000,  
			parts: 2
		}
	});	

	fastify.addHook('onRequest', async (req) => {
		if (req.url.startsWith('/api/dash/docs') || req.url.startsWith('/api/dash/verify-cli/')) {
			return
		}
		await req.jwtVerify()
	})

	fastify.register(import('@fastify/swagger'))
	fastify.register(import('@fastify/swagger-ui'), { routePrefix: '/api/dash/docs', })

	fastify.register(import('./routes/relationsR.js'))
	fastify.register(import('./routes/profilesR.js'))
	fastify.register(import('./routes/storeR.js'))
	fastify.register(import('./routes/gameStatsR.js'))
	fastify.register(import('./routes/leaderboardR.js'))
	fastify.register(import('./routes/twofaR.js'))

	fastify.register(import('./utils/kafkaConsumer.js'))

	return fastify
}

export default appBuilder