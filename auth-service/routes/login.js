import Account from '../models/Account.js'
import bcrypt from 'bcrypt'


const auth = (fastify, options, done) => {

    const loginHandler = async (req, res) => {
        const {username, password} = req.body

        const user = await Account.findOne({where :{username : username}})
        if (!user)
            return res.status(401).send({Success: 'false', Error: 'User does not exist'})
        if (user.is_oauth)
            return res.status(401).send({Success: 'false', Error: 'Use Oauth to login'})

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).send({Success: 'false', Error: 'Incorrect Password'})

        const token = fastify.jwt.sign({id: user.id})

        res.status(200).send({Success: 'true', token:token})
    }

    const loginSchema = {
        schema:
        {
            body:
            {
                type:'object',
                required : ['username', 'password'],
                properties:
                {
                    username: {type: 'string', maxLength: 15},
                    password: {type: 'string', minLength: 8 ,maxLength: 25},
                }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { Success: {type: 'string'}, token: {type : 'string'} }
                },
                '4xx':
                {
                    type:'object',
                    properties:
                    {
                        Success:{type:'string'},
                        Error:{type:'string'}
                    }
                }
            }
        },
        handler: loginHandler
    }

    fastify.post('/login', loginSchema)

    fastify.get('/list', async (req, res) => {
        res.send(await Account.findAll())
    })

    
    done() //async ?
}

export default auth