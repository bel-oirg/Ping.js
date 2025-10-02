import fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyJwt from '@fastify/jwt';
import FastifySocketIO from '@ericedouard/fastify-socket.io';

import newCache from './plugins/queue.js';
import gameRooms from './plugins/rooms.js';
import kafkaProducerPlugin from './plugins/producer.js';
import { enableGameSocketHandlers } from './handlers.js';


const app = fastify({
	logger: {
		level: process.env.LOG_LEVEL || 'info',
		ignore: 'pid,hostname,reqId',
		formatters: {
			level: (label) => ({ level: label }),
			bindings: () => ({})
		},
		base: undefined,
		timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
		hostname: false,
		singleline: true
	}
});



const Cors = {
	origin: [process.env.NEXT_PUBLIC_API_URL],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'OPTIONS'],
	exposedHeaders: ['Authorization'],
};


app.register(FastifyCors, Cors);
app.register(newCache);
app.register(gameRooms);
app.register(kafkaProducerPlugin);
app.register(FastifySocketIO, {
	cors: Cors,
	transports: ['websocket'],
	path: "/game.socket/",
	reconnection: true
});
app.register(FastifyJwt, { secret: process.env.JWT_SECRET });


app.register(async function () {
	app.io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			const { id } = app.jwt.verify(token);
			socket.user = id;

			next();
		} catch {
			return next(new Error('Authorization error'));
		}
	});

	app.io.on('connection', async function (socket) {
		const userId = socket.user;

		socket.emit('welcome', `Welcome to Pong: ${userId}`);

		enableGameSocketHandlers(socket, app);

	});
});

(async () => {
	await app.ready();


	await app.listen({ port: 8004, host: "0.0.0.0" }, (err) => {
		if (err) {
			console.error('Server error:', err);
		}
	});
})();
