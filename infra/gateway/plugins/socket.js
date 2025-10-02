import fp from 'fastify-plugin';
import { Server } from 'socket.io';
import { initializeSocketHandlers } from '../utils/socketManager.js';
import { createOnlineUsersService } from '../utils/onlineUsersService.js';
import { cors as corsConfig } from '../config/index.js';

export default fp(async function (fastify, opts) {
  fastify.decorate('io', null)
  fastify.decorate('onlineUsersService', null)
  
  fastify.addHook('onReady', async () => {
    const io = new Server(fastify.server, {
      cors: {
        origin: corsConfig.origin,
        methods: corsConfig.methods,
        credentials: corsConfig.credentials
      },
      path: '/gateway.socket',
      serveClient: false,
      pingTimeout: 30000,
      pingInterval: 10000,
      transports: ['websocket', 'polling']
    })
    
    const onlineUsersService = createOnlineUsersService(fastify.redis, fastify.userService)
    fastify.onlineUsersService = onlineUsersService
    initializeSocketHandlers(io, fastify.redis, fastify)    
    fastify.io = io
    fastify.log.info('[SOCKET] Socket.IO server ready')
  })
  
  fastify.addHook('onClose', async (instance) => {
    if (instance.onlineUsersService && instance.onlineUsersService.disconnectionTimers) {
      fastify.log.info(`[SOCKET] Clearing ${instance.onlineUsersService.disconnectionTimers.size} disconnection timers`)
      for (const timer of instance.onlineUsersService.disconnectionTimers.values()) {
        clearTimeout(timer)
      }
      instance.onlineUsersService.disconnectionTimers.clear()
    }
    
    if (instance.io) {
      const sockets = await instance.io.fetchSockets()
      fastify.log.info(`[SOCKET] Closing ${sockets.length} active socket connections`)
      for (const socket of sockets) {
        socket.disconnect(true)
      }
      instance.io.close()
      fastify.log.info('[SOCKET] Socket.IO server closed')
    }
  })
}, {
  name: 'fastify-socket.io',
  dependencies: ['core-plugins', 'fastify-redis']
}); 