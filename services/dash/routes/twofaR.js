import twofaC from '../controllers/twofaC.js'

const twofaR = (fastify, options, done) => {

    const update2faSchema = {
        querystring: {
            type: 'object',
            required: ['activate'],
            properties: {
                activate: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' }
                }
            },
            400: {
                type: 'object',
                properties: {
                    Error: { type: 'string' }
                }
            }
        },
        handler: twofaC.twofaC
    }

    const getQRSchema = {
        querystring: {
            type: 'null'
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    qrCode: { type: 'string' }
                }
            },
            400: {
                type: 'object',
                properties: {
                    Error: { type: 'string' }
                }
            }
        },
        handler: twofaC.getQRC
    }

    const verifyOTPSchema = {
        querystring: {
            type: 'object',
            properties: {
                code: {type: 'string'}
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    verified: {type: 'boolean'}
                }
            },
            400: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    Error: { type: 'string' }
                }
            }
        },
        handler: twofaC.verifyOTP
    }


    fastify.get('/api/dash/update-2fa/', update2faSchema)
    fastify.get('/api/dash/get-QR/', getQRSchema)
    fastify.post('/api/dash/verify-2fa/', verifyOTPSchema)

    done()
}

export default twofaR