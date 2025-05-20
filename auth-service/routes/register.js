import bcrypt from 'bcrypt'
import pool from '../config/db.js'


const RegisterRoute = (fastify, options, done) =>
{
    const passValidator = (password) => {
        let errors = []
        if (!/[a-z]/.test(password))
            errors.push('Password must contain [a-z]')
        if (!/[A-Z]/.test(password))
            errors.push('Password must contain [A-Z]')
        if (!/[0-9]/.test(password))
            errors.push('Password must contain [0-9]')
        if (!/[@$!%*?&'"]/.test(password))
            errors.push('Password must contain [@$!%*?&\'"]')
        return errors
    }

    const emailValidator = (email) =>
    {
        return (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    }

    const registerHandler = async (req, res) => {
        try
        {
            const {username , email, password, repassword, first_name, last_name} = req.body
            if (emailValidator(email))
                throw new Error("Email does not comply with requirements")
            
            if (password !== repassword)
                throw new Error('Passwords do not match.')
            
            let errors = passValidator(password)
            if (errors.length) //TODO maybe change it into errors only
                throw new Error(errors)

            
            const tvals = [username , email, await bcrypt.hash(password, 10), first_name, last_name]
        
            await pool.query('INSERT INTO account(username, email, pass, first_name, last_name) VALUES($1, $2, $3, $4, $5);', tvals)
            res.status(201).send({Success : 'true'})
        }
        catch(err)
        {
            res.status(400).send({Success:false, Error : err.message})
        }
    }

    const registerSchema = {
        schema:
        {
            body:
            {
                type:'object',
                required : ['username', 'email', 'password', 'repassword'],
                properties:
                {
                    username: {type: 'string', maxLength: 15},
                    email: {type: 'string', maxLength: 35},
                    password: {type: 'string', minLength: 8 ,maxLength: 25},
                    repassword: {type: 'string', minLength: 8 ,maxLength: 25},
                    first_name: {type: 'string', maxLength: 15},
                    last_name: {type: 'string', maxLength: 15},
                }
            },
            response:
            {
                '201':
                {
                    type : 'object',
                    properties:
                    {
                        Success: {type: 'string'}
                    }
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
        handler: registerHandler
    }
    
    fastify.post('/register', registerSchema)

    fastify.get('/all', async (req, res) => {
        const users = await pool.query('SELECT * FROM account')
        res.send(JSON.stringify(users.rows, null, 2))
    })

    done()
}

export default RegisterRoute
