import bcrypt from 'bcrypt'
import pool from '../config/pooling.js'
import kafkaProd from '../config/kafkaProd.js'
import {authenticator} from 'otplib'

function passValidator (password) {
    let errors = []
    if (password && password.length < 10)
        errors.push('Password must contain at least 10 characters')
    if (!/[a-z]/.test(password))
        errors.push('Password must contain [a-z]')
    if (!/[A-Z]/.test(password))
        errors.push('Password must contain [A-Z]')
    if (!/[0-9]/.test(password))
        errors.push('Password must contain [0-9]')
    return errors
}

const emailValidator = (email) =>
{
    return (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

const registerS = async (username , email, password, repassword, first_name, last_name) => {
    if (emailValidator(email))
        throw new Error("Email does not comply with requirements")
    
    if (password !== repassword)
        throw new Error('Passwords do not match.')
    
    let errors = passValidator(password)
    if (errors.length)
        throw new Error(errors)

    const otp_secret = authenticator.generateSecret()
    const tvals = [username ,email, await bcrypt.hash(password, 10), otp_secret]


    let user_id, result;
    await pool.query('BEGIN')
    try
    {
        result = await pool.query(
            'INSERT INTO account(username, email, password, otp_secret) \
            VALUES($1, $2, $3, $4) RETURNING id;',
            tvals
        );
        user_id = result.rows[0].id
        
        await pool.query('COMMIT')
    }
    catch(err)
    {
        await pool.query('ROLLBACK')
        throw err
    }

    if (result.rowCount == 1)
    {
        await kafkaProd('newUser', 
        {
            id: user_id,
            username: username,
            email: email,
            first_name: first_name,
            last_name: last_name,
            otp_secret: otp_secret,
            is_oauth: false
        })
    }
}

export default registerS