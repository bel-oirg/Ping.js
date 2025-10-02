import loginC from '../controllers/loginC.js'


const auth = (fastify, options, done) => {

    const loginSchema = {
        schema:
        {
            body:
            {
                type:'object',
                required : ['username', 'password'],
                properties:
                {
                    username: {type: 'string', minLength: 4, maxLength: 15},
                    password: {type: 'string', minLength: 8 ,maxLength: 25},
                }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { token: {type : 'string'}, otp_token: {type: 'string'} }
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
        handler: loginC(fastify)
    }
    fastify.post('/api/auth/login/', loginSchema)

    done()
}

export default auth