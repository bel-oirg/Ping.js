import sendMsgC from '../controllers/sendMsgC.js'

const sendMsgR = (fastify, options, done) => {

    const sendMsgSchema = {
        body: {
          type: 'object',
          properties: {
            id: { type: 'string' }, 
            msg: { type: 'string' }
          },
          required: ['id', 'msg']
        },
        response: {
          200: {
            type: 'null',
          },
          400: {
            type: 'object',
            properties: {
              Error: { type: 'string' }
            },
            required: ['Error']
          }
        },
        handler: sendMsgC
      }

    fastify.post('/api/chat/msg/', sendMsgSchema)

    done()
}

export default sendMsgR