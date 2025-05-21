import pool from '../config/db.js'
import bcrypt from 'bcrypt'


const auth = (fastify, options, done) => {

    const loginHandler = async (req, res) => {
        const {username, password} = req.body

        const user = await pool.query('SELECT id, is_oauth, pass FROM account WHERE username = $1 AND is_oauth = false;', [username])
        if (!user.rows.length)
            return res.status(401).send({Success: 'false', Error: 'User does not exist'})
        //INFO the oauth user cannot login cause the schema checks on minLenght on password
        const is_match = await bcrypt.compare(password, user.rows[0].pass)
        if (!is_match)
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

    done()
}

export default auth