import pool from "../config/pooling.js"
import {authenticator} from 'otplib'
import jwt from 'jsonwebtoken'


const twofaS = async (fastifyjwt, code, otp_token) => {
    const decoded = jwt.verify(otp_token, process.env.JWT_SECRET_2FA)
    const q_data = await pool.query("SELECT otp_secret, is_otp FROM account \
        WHERE id = $1", [decoded.id])
    if (!q_data.rowCount)
        throw new Error('User does not exist')
    if (!q_data.rows[0].is_otp)
        throw new Error('User has no 2FA activated')
    const verify = authenticator.check(code, q_data.rows[0].otp_secret)
    if (verify)
        return fastifyjwt.sign({id: decoded.id})

    throw new Error('invalid otp-code')
}

export default twofaS