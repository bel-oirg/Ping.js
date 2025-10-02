import twofaS from "../services/twofaS.js"
import pool from '../config/pooling.js'

export default {
    async twofaC (req, res) {
        try
        {
            await pool.query('BEGIN')

            const {activate} = req.query
            await twofaS.twofaS(req.user.id, activate)
            
            await pool.query('COMMIT')
            res.status(200).send({success: true})
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({Error:err.message})
        }
    },
    async getQRC (req, res) {
        try
        {
            const qrCode = await twofaS.getQRS(req.user.id)
            res.status(200).send({qrCode: qrCode})
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },
    async verifyOTP (req, res) {
        try
        {
            const { code } = req.body
            const verified = await twofaS.verifyOTP(req.user.id, code)
            
            if (verified) {
                res.status(200).send({success: true, verified: true})
            } else {
                res.status(400).send({success: false, Error: "Invalid verification code"})
            }
        }
        catch(err)
        {
            res.status(400).send({Error: err.message})
        }
    }
}