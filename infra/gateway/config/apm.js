'use strict'

import apmNode from 'elastic-apm-node'

export const apmConfig = {
  serviceName: 'get-service',
  serverUrl: process.env.APM_SERVER_URL || 'http://apm-server:8200',
  environment: process.env.NODE_ENV || 'development',  
  active: process.env.APM_ACTIVE !== 'false',
  logUncaughtExceptions: true,
  captureExceptions: true,  
  transactionSampleRate: parseFloat(process.env.APM_SAMPLE_RATE || '1.0'),
  metricsInterval: '30s',
  sanitizeFieldNames: [
    'password', 'passwordConfirmation', 'token',
    'service.name', 'http.method', 'http.url'
  ],  
  distributedTracingOrigins: [
    'http://frontend:3000',
    'https://blackholejs.art',
    'http://blackholejs.art'
  ],
  instrumentIncomingHTTPRequests: true,
  useElasticTraceparentHeader: true,
  centralConfig: false,
  cloudProvider: 'none',  
  disableInstrumentations: []
}

/**
 * Initialize APM with custom logger
 * @param {Object} fastify - Fastify instance for logging
 * @returns {Object|null} - APM instance or null if initialization fails
 */
export function initializeApm(fastify) {
  try {
    const config = {
      ...apmConfig,
      logger: {
        info(msg) {
          fastify.log.info(sanitizeLogMessage(msg))
        },
        warn(msg) {
          fastify.log.warn(sanitizeLogMessage(msg))
        },
        error(msg) {
          fastify.log.error(sanitizeLogMessage(msg))
        },
        debug(msg) {
          fastify.log.debug(sanitizeLogMessage(msg))
        }
      }
    }    
    const apm = apmNode.start(config)
    return apm
  } catch (err) {
    fastify.log.error(`Failed to initialize APM: ${err.message}`)
    return null
  }
}

/**
 * Sanitize log messages to remove non-printable characters
 * @param {string} message - Message to sanitize
 * @returns {string} - Sanitized message
 */
function sanitizeLogMessage(message) {
  return typeof message === 'string' 
    ? message.replace(/[^\x20-\x7E]/g, '') 
    : message
}

export default { initializeApm, apmConfig } 