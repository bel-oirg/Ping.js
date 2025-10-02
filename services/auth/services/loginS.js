import pool from "../config/pooling.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default {
	async loginS(fastifyjwt, username, password) {

		const user = await pool.query('SELECT id, password, is_otp, email FROM account     \
            WHERE username = $1 AND is_oauth = false;', [username])
		if (!user.rows.length) {
			const err = new Error("User does not exist")
			err.status = 401
			throw err
		}
		const is_match = await bcrypt.compare(password, user.rows[0].password)
		if (!is_match) {
			const err = new Error("Incorrect Password")
			err.status = 401
			throw err
		}

		if (user.rows[0].is_otp) {
			const token = jwt.sign({ id: user.rows[0].id, is_otp: true }, process.env.JWT_SECRET_2FA,
				{ expiresIn: '10m' })

			return {otp_token:token}
		}

		return {token :fastifyjwt.sign({ id: user.rows[0].id })}
	},
}