import pool from '../config/pooling.js'
import {authenticator} from 'otplib'
import kafkaProd from '../config/kafkaProd.js'
import jwt from 'jsonwebtoken'


const intraS = async (jwtFastify, code) => {
    let params = {
        'code':code,
        'client_id' : process.env.CLIENT_ID_42,
        'client_secret': process.env.CLIENT_SECRET_42,
        'redirect_uri' : process.env.REDIRECT_42,
        'grant_type': 'authorization_code'
    }  
    const form_params = new URLSearchParams(params)
    
    const raw = await fetch(process.env.TOKEN_42,
        {
            method: 'POST',
            body: form_params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        })
    if (!raw.ok)
    {
        const err = new Error(`${raw.status}`)
        err.status = 409
        throw err
    }
    
    const user_creds =  await raw.json()
    
    const user_data = await fetch(process.env.INTRA_42, {
        headers: {'Authorization': `Bearer ${user_creds['access_token']}`},
    })
    
    if (!user_data.ok)
    {
        const err = new Error(`[-] USER DATA ${user_data.status}`)
        err.status = 409
        throw err
    }

    const user_json =  await user_data.json()
    const lvalues = [user_json.login, user_json.email]
    let try_login = await pool.query('SELECT id FROM account WHERE username = $1 AND email = $2 AND is_oauth = true', lvalues)
    
    if (try_login.rowCount) {
        const check = await pool.query('SELECT is_otp FROM account WHERE id = $1', [try_login.rows[0].id])
        if (check.rows[0].is_otp) {
            const token = jwt.sign({ id: try_login.rows[0].id, is_otp: true },process.env.JWT_SECRET_2FA, { expiresIn: '10m' })
            return { otp_token: token }
        }       
        return jwtFastify.sign({id: try_login.rows[0].id})
    }

    const search = await pool.query('SELECT EXISTS(SELECT 1 FROM account WHERE username = $1 OR email = $2);', lvalues)
    
    if (search.rows[0].exists)
    {
        const err = new Error('Your username/email is not unique')
        err.status = 409
        throw err
    }

    const otp_secret = authenticator.generateSecret()

    const new_user = [user_json.login, user_json.email, 'R3ndom789KEPLERliok', true, otp_secret]
    const created_user = await pool.query('INSERT INTO          \
        account(username, email, password, is_oauth, otp_secret)   \
        VALUES($1, $2, $3, $4, $5) RETURNING id;', new_user)
    
    await kafkaProd('newUser',
             {
                id:created_user.rows[0].id,
                username: user_json.login,
                email: user_json.email,
                first_name: user_json.first_name,
                last_name: user_json.last_name,
                otp_secret: otp_secret,
                is_oauth: true,
                avatar: user_json.image.link,
                background: '/data/backgrounds/default.png'
             })

    return jwtFastify.sign({id:created_user.rows[0].id})
}

export default intraS