import convC from '../controllers/convC.js'

const convR = (fastify, options, done) => {
    // schema


    fastify.get('/api/chat/conversation/', convC)

    done()
}

export default convR