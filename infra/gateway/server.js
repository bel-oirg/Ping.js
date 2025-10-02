'use strict'

import { createApp } from './app.js'
import { server as serverConfig } from './config/index.js'
import { gracefulRedisCleanup } from './utils/redisCleanup.js'

const isProduction = process.env.NODE_ENV === 'production'

async function start() {
  let app = null
  
  try {
    app = await createApp()
    
    const address = await app.listen({
      port: process.env.PORT || serverConfig.port,
      host: serverConfig.host
    })
    
    app.log.info(`Server listening at ${address}`)
    
    let startupTransaction = null
    if (app.apm) {
      startupTransaction = app.apm.startTransaction('server-startup', 'startup')
    }
    
    try {
      if (startupTransaction) {
        startupTransaction.result = 'success'
        startupTransaction.end()
      }
    } catch (err) {
      if (startupTransaction) {
        startupTransaction.result = 'error'
        startupTransaction.end()
      }
      app.log.error(`Error during server initialization: ${err.message}`)
    }
    
    const closeGracefully = async (signal) => {
      app.log.info(`Received ${signal}. Shutting down server...`)
      try {
        if (app.onlineUsersService && app.onlineUsersService.disconnectionTimers) {
          app.log.info(`Clearing ${app.onlineUsersService.disconnectionTimers.size} disconnection timers`)
          for (const timer of app.onlineUsersService.disconnectionTimers.values()) {
            clearTimeout(timer)
          }
          app.onlineUsersService.disconnectionTimers.clear()
        }
        
        if (app.redis) {
          app.log.info('Cleaning up Redis connections...')
          await gracefulRedisCleanup(app.redis)
        }
        
        await app.close()
        app.log.info('Server shutdown complete')
        process.exit(0)
      } catch (err) {
        app.log.error(`Error during shutdown: ${err.message}`)
        process.exit(1)
      }
    }
    
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.on(signal, () => closeGracefully(signal))
    }
    
    process.on('uncaughtException', (err) => {
      app.log.error(`Uncaught exception: ${err.message}`)
      app.log.error(err.stack)
      if (isProduction) {
        closeGracefully('uncaughtException').catch(() => process.exit(1))
      }
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      app.log.error('Unhandled rejection at:', promise)
      app.log.error('Reason:', reason)
      if (isProduction) {
        closeGracefully('unhandledRejection').catch(() => process.exit(1))
      }
    })
  } catch (err) {
    console.error(`Server error: ${err.message}`)
    console.error(err.stack)
    process.exit(1)
  }
}

start()
