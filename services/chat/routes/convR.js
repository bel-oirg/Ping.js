import convC from '../controllers/convC.js'

const convR = (fastify, options, done) => {


    const convSSchema = {
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sender: { type: 'integer' },
                data: { type: 'string' },
                created_at: { type: 'string' }
              },
            }
          }
        },
        handler: convC
      }
      
    fastify.get('/api/chat/conversation/', convSSchema)

    done()
}

export default convR