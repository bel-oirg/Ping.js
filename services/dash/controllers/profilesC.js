import dp from "../services/profilesS.js"
import pool from '../config/pooling.js'

function passValidator (password) {
    let errors = []
    if (password.length < 10)
        errors.push('Password must contain at least 10 characters')
    if (!/[a-z]/.test(password))
        errors.push('Password must contain [a-z]')
    if (!/[A-Z]/.test(password))
        errors.push('Password must contain [A-Z]')
    if (!/[0-9]/.test(password))
        errors.push('Password must contain [0-9]')
    return errors
}

export default {
    async profilesC (req, res) {
        try
        {
            await pool.query('BEGIN')
            let data;
            if (req.query['id'])
                data = await dp.display_profile(req.query['id'], req.user.id)
            else
                data = await dp.display_profile(req.user.id, req.user.id)
            
            await pool.query('COMMIT')
            res.status(200).send(data)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({ error: 'Operation Failed'})
        }
    },

    async searchC(req, res){
        try
        {
            await pool.query('BEGIN')
            const searchq = req.query['q']
            if (!searchq)
                throw new Error('Empty input')
            const data = await dp.searchS(searchq)
            await pool.query('COMMIT')

            res.status(200).send(data)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({ Error: 'Operation Failed' })
        }
    },
    
    async changePassC(req, res){
        try
        {
            await pool.query('BEGIN')
            const {old_pass, new_pass, re_pass} = req.body
            if (new_pass != re_pass)
                throw new Error('Passwords does not match')
            
            console.log(old_pass, new_pass)
            if (old_pass == new_pass)
                throw new Error('The new password is the same as the old')
            const errs = passValidator(new_pass)
            if (errs.length)
                throw new Error(errs)
            
            await dp.changePassS(req.user.id, req.headers.authorization, old_pass, new_pass) 
            
            await pool.query('COMMIT')
            res.status(204)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            if (err.status)
                return res.status(401).send({Error: 'Incorrect password'})
            res.status(400).send({ Error: 'Operation Failed' })
        }
    },

    async editC(req, res){

        try
        {
            await pool.query('BEGIN')
            const {first_name, last_name} = req.body
            if (!first_name && !last_name)
                throw new Error('No field is defined')

            await dp.editS(req.user.id, first_name, last_name)
            await pool.query('COMMIT')

            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({ Error: 'Operation Failed' })
        }
    },

    async resetCliTokenC(req, res){
        try
        {
            await pool.query('BEGIN')
            const data = await dp.resetCliTokenS(req.user.id)
            await pool.query('COMMIT')

            res.status(200).send({token : data})
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({ Error: 'Operation Failed' })
        }
    },

    async getCliTokenC(req, res){
        try
        {
            await pool.query('BEGIN')
            const data = await dp.getCliTokenS(req.user.id)
            await pool.query('COMMIT')

            res.status(200).send({token : data})
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({ Error: 'Operation Failed' })
        }
    },

    verifyCliTokenC : (fastify) => async(req, res) => {
        try
        {
            await pool.query('BEGIN')
            const {token} = req.body
            const data = await dp.verifyCliTokenS(fastify.jwt, token)
            await pool.query('COMMIT')

            res.status(200).send({id : data})
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(401).send({ Error: 'Operation Failed' })
        }
    },

    async updateAvatarC(req, res) {
        try
        {
            await pool.query('BEGIN')
            const data = await req.file()

            await dp.updateAvatarS(data, req.user.id)

            await pool.query('COMMIT')
            res.status(200)
        }
        catch(err)
        {
            await pool.query('ROLLBACK')
            res.status(400).send({ Error: 'Operation Failed' })
        }
    }
}
