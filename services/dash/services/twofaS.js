import kafkaProd from '../config/kafkaProd.js'
import pool from '../config/pooling.js'
import { authenticator } from 'otplib'

export default {

    async twofaS (accountID, activate) {
        if (activate == 0){
            await pool.query('UPDATE player SET is_otp = false WHERE id = $1;', [accountID]);
            await kafkaProd('OTP', {
                id: accountID,
                activate: activate
            });
            return true
        }
        return false
    },

    async getQRS(accountID){
        const raw = await pool.query('SELECT QRCODE from player WHERE id = $1', [accountID])
        return raw.rows[0].qrcode
    },
    
    async verifyOTP(accountID, code) {
        const accountCheck = await pool.query('SELECT otp_secret FROM player WHERE id = $1', [accountID])        

        const secret = accountCheck.rows[0].otp_secret
        const isValid = authenticator.check(code, secret)
        if (isValid) {
            await kafkaProd('OTP', {
                id: accountID,
                activate: 1
            })
            await pool.query('UPDATE player SET is_otp = true WHERE id = $1;', [accountID]);
        }
        return isValid
    }
}
