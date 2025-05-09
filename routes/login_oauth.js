import Account from '../models/Account.js'
import https from 'https'
import fs from 'fs'
import path from 'path'
import {Op} from 'sequelize'

const DEFAULT_AVATAR = path.join(process.cwd(), 'media', 'avatar', 'default_avatar.jpg')

const oauth42 = (fastify, options, done) => {
    
    fastify.get('/oauth/', async (req, res) => {
        try
        {
            let params = {
                'code':req.query['code'],
                'client_id' : process.env.CLIENT_ID_42,
                'client_secret': process.env.CLIENT_SECRET_42,
                'redirect_uri' : process.env.REDIRECT_42,
                'grant_type': 'authorization_code'
            }  
            const form_params = new URLSearchParams(params)
            //OAuth token endpoints require app/x-form
            
            const raw = await fetch(process.env.TOKEN_42,
                {
                    method: 'POST',
                    body: form_params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                })
            if (!raw.ok)
                throw new Error(`${raw.status}`)
            
            const user_creds =  await raw.json()
            
            const user_data = await fetch(process.env.INTRA_42, {
                headers: {'Authorization': `Bearer ${user_creds['access_token']}`},
            })
            
            if (!user_data.ok)
                throw new Error(`${user_data.status}`)
            
            const user_json =  await user_data.json()

            const try_login = await Account.findOne({ where : {username : user_json.login, email : user_json.email}})
            if (try_login)
            {
                const token = fastify.jwt.sign({user_id:try_login.id})
                return res.code(200).send({Success: true, token: token})
            }

            const search = await Account.findOne({ where : { [Op.or] : [
                {username : user_json.login}, {email : user_json.email }] }})
            
            if (search)
                return res.code(409).send({Success: false, Error: 'Your username/email is not unique'})

            let file_path = path.join(process.cwd(), 'media', 'avatar', `${user_json.login}.jpg`)
            if (fs.existsSync(file_path))
                fs.unlink(file_path, (err) => {
                    if (err) throw new Error(`Cannot unlink ${file_path}`)
                    else console.log('File Deleted');
            })

            const file_fs = fs.createWriteStream(file_path)
            https.get(user_json.image.link, (response) => {
                response.pipe(file_fs)
                file_fs.on('finish', ()=>{
                    file_fs.close(() => {
                        console.log('File Downloaded Succesfuly')
                    })
                })
                .on('error', () => {
                    file_fs.unlink(file_path, () => {
                        console.log('Error downloading the file')
                        file_path = DEFAULT_AVATAR
                    })
                })
            })

            const created_user = await Account.create({
                username:user_json.login,
                email:user_json.email,
                first_name:user_json.first_name,
                last_name:user_json.last_name,
                is_oauth: true,
                avatar: file_path
            })

            const token = fastify.jwt.sign({user_id:created_user.id})
            return res.code(200).send({Success: true, token: token})
        }
        catch(err)
        {
            return res.code(400).send({Success: false, Error: err.message})
        }
    })
                
    fastify.get('/42', (req, res) => {
        res.redirect(process.env.API_42)
    })

    done()
}

export default oauth42