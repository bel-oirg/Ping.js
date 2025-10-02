'use strict'

import fp from 'fastify-plugin'
import { initializeApm } from '../config/apm.js'

export default fp(async function (fastify, opts) {
  const apm = initializeApm(fastify)
  
  if (!apm) {
    fastify.log.warn('APM initialization failed, continuing without APM')
    return
  }
  
  fastify.decorate('apm', apm)
  
  fastify.addHook('onRequest', (request, reply, done) => {
    const transaction = apm.startTransaction(
      `${request.method} ${request.routerPath || request.url}`, 
      'request'
    )
    // console.log(request.method, request.routerPath || request.url);
    request.apmTransaction = transaction
    transaction.addLabels({
      'request_id': request.id,
      'http_method': request.method.split(' ')[0],
      'http_path': request.method.split(' ')[1]
    })    
    request.apmSpan = transaction.startSpan('get-service', 'request.processing')
    done()
  })
  
  fastify.addHook('onResponse', (request, reply, done) => {
    if (!request.apmTransaction) return done()    
    if (request.apmSpan) {
      request.apmSpan.end()
    }
    
    request.apmTransaction.result = reply.statusCode < 400 ? 'success' : 'error'
    request.apmTransaction.setOutcome(reply.statusCode < 400 ? 'success' : 'failure')
    
    request.apmTransaction.addLabels({
      'http_status_code': reply.statusCode,
      'response_time': reply.getResponseTime()
    })
    
    request.apmTransaction.end()
    
    done()
  })
  
  fastify.addHook('onError', (request, reply, error, done) => {
    if (!apm) return done()
    
    apm.captureError(error, {
      request: request.raw,
      response: reply.raw,
      labels: {
        'error_type': error.name,
        'http_status_code': reply.statusCode
      }
    })
    
    if (request.apmTransaction) {
      request.apmTransaction.setOutcome('failure')
    }
    
    done()
  })
  
  fastify.decorate('createTransaction', (name, type, options = {}) => {
    if (!apm) return null
    return apm.startTransaction(name, type, options)
  })
  fastify.decorate('createSpan', (name, type, options = {}, parent = null) => {
    if (!apm) return null
    const parentTransaction = parent || apm.currentTransaction
    if (!parentTransaction) return null
    return parentTransaction.startSpan(name, type, options)
  })
  
  fastify.log.info('APM plugin registered successfully')
}, {
  name: 'fastify-apm'
}) 