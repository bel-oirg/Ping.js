import { OAuth2Client } from 'google-auth-library'
import pool from "../config/pooling.js"
import kafkaProd from '../config/kafkaProd.js'
import {authenticator} from 'otplib'
import jwt from 'jsonwebtoken'

const googleS = async (jwtfastify, code) => {

	const oauth2C = new OAuth2Client({ //new google client
		clientId: process.env.CLIENT_ID_GOOGLE,
		clientSecret: process.env.CLIENT_SECRET_GOOGLE,
		redirectUri: process.env.GOOGLE_REDIRECT
	})

	const { tokens } = await oauth2C.getToken(code)

	oauth2C.setCredentials(tokens)

	const ticket = await oauth2C.verifyIdToken({ //verify jwt token, to see if it is coming from google
		idToken: tokens.id_token,
		audience: process.env.CLIENT_ID_GOOGLE
	})

	const user_json = await ticket.getPayload()

	const try_login = await pool.query('SELECT id FROM account WHERE username = $1 AND email = $2 AND is_oauth = $3', [user_json.name, user_json.email, true])

	if (try_login.rows[0])
	{
		const check = await pool.query('SELECT is_otp FROM account WHERE id = $1', [try_login.rows[0].id])
		if (check.rows[0].is_otp) {
			const token = jwt.sign({ id: try_login.rows[0].id, is_otp: true }, process.env.JWT_SECRET_2FA, { expiresIn: '10m' })
			return { otp_token: token }
		}

		return jwtfastify.sign({ id: try_login.rows[0].id })
	}

	const search = await pool.query('SELECT EXISTS (SELECT 1 FROM account WHERE username = $1 OR email = $2)', [user_json.name, user_json.email])

	if (search.rows[0].exists) {
		const err = new Error('Your username/email is not unique')
		err.status = 409
		throw err
	}

	const avatar = user_json.picture ? user_json.picture : '/data/avatars/default.png'

    const otp_secret = authenticator.generateSecret()

	const new_user = [user_json.name, user_json.email, 'R3ndom789KEPLERliok', true, otp_secret]
	const created_user = await pool.query('INSERT INTO 								\
		account(username, email, password,  is_oauth, otp_secret) \
		 VALUES($1, $2, $3, $4, $5) RETURNING id;', new_user)

    await kafkaProd( 'newUser',
            {
                id:created_user.rows[0].id,
                username: user_json.name,
                email: user_json.email,
                first_name: user_json.given_name,
                last_name: user_json.family_name,
                otp_secret: otp_secret,
                is_oauth: true,
                avatar: avatar,
                background: '/data/backgrounds/default.png'
            })


	return jwtfastify.sign({ id: created_user.rows[0].id })
}

export default googleS