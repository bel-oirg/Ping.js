import pool from '../config/pooling.js'
import qrcode from 'qrcode'
import {authenticator} from 'otplib'

const insertQR = async (accountID) => {
    const {otp_secret, username} = (await pool.query('SELECT otp_secret, username FROM player \
        WHERE id = $1', [accountID])).rows[0]

    const keyUri = authenticator.keyuri(username, 'blackholejs', otp_secret)
    const qrcodeData = await qrcode.toDataURL(keyUri)

    await pool.query('UPDATE player SET QRCODE = $1 WHERE id = $2', [qrcodeData,accountID])
}

export default insertQR