import twofaC from '../controllers/twofaC.auth.js'

const twofa = (fastify, options, done) => {

    const twofaSchema = {
        schema:
        {
            body:
            {
                type:'object',
                required : ['otp_token', 'code'],
                properties:
                {
                    otp_token: {type: 'string'},
                    code: {type: 'string'},
                }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { token: {type : 'string'} }
                },
                '4xx':
                {
                    type:'object',
                    properties:
                    {
                        Error:{type:'string'}
                    }
                }
            }
        },
        handler: twofaC(fastify)
    }

    fastify.post('/api/auth/login/2fa/', twofaSchema)

    done()
}

export default twofa