import {OAuth2Client} from 'google-auth-library'
import Account from '../models/Account.js'
import https from 'https'
import fs from 'fs'
import path from 'path'
import {Op} from 'sequelize'

const oauth2google = (fastify, options, done) => {


    const oauth2C = new OAuth2Client({
        clientId: process.env.CLIENT_ID_GOOGLE,
        clientSecret: process.env.CLIENT_SECRET_GOOGLE,
        redirectUri: process.env.GOOGLE_REDIRECT
    })




    const hanlderGoogle = async (req, res) => {
        try
        {
            const code = req.query['code']

            const {tokens} = await oauth2C.getToken(code)

            oauth2C.setCredentials(tokens)

            const ticket = await oauth2C.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.CLIENT_ID_GOOGLE
            })

            const user_json = await ticket.getPayload()
            console.log(user_json)

            const try_login = await Account.findOne({ where : {username : user_json.name,
                                                            email : user_json.email,
                                                            is_oauth: true}})
            if (try_login)
            {
                const token = fastify.jwt.sign({user_id:try_login.id})
                return res.status(200).send({Success: true, token: token})
            }

            const search = await Account.findOne({ where : { [Op.or] : [
                {username : user_json.name}, {email : user_json.email }] }})
            
            if (search)
                return res.status(409).send({Success: false, Error: 'Your username/email is not unique'})

            let file_path = path.join(process.cwd(), 'media', 'avatar', `${user_json.name}.jpg`)
            if (fs.existsSync(file_path))
                fs.unlink(file_path, (err) => {
                    if (err) throw new Error(`Cannot unlink ${file_path}`)
                    else console.log('File Deleted');
            })

            const file_fs = fs.createWriteStream(file_path)
            https.get(user_json.picture, (response) => {
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
                username:user_json.name,
                email:user_json.email,
                first_name:user_json.given_name,
                last_name:user_json.family_name,
                is_oauth: true,
                avatar: file_path
            })

            const token = fastify.jwt.sign({user_id:created_user.id})
            return res.status(200).send({Success: true, token: token})
        }
        catch(err)
        {
            return res.status(400).send({Success:false, Error:err.message})
        }
    }

    const oauthGoogleSchema = {
        schema:
        {
            querystring:
            {
                type: 'object',
                required: ['code'],
                properties: { code: {type:'string'} }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { Success: {type: 'string'}, token: {type : 'string'} }
                },
                '4xx':
                {
                    type:'object',
                    properties:
                    {
                        Success:{type:'string'},
                        Error:{type:'string'}
                    }
                }
            }
        },
        handler: hanlderGoogle
    }

    fastify.get('/oauth/google/', oauthGoogleSchema) 

    fastify.get('/google/',(_, res) => {

        const authURL = oauth2C.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email']
        })

        res.redirect(authURL)
    })

    done()
}

/**
 * {
  iss: 'https://accounts.google.com',
  azp: '373713270678-0dro9nrh86tlpcse6a4bia0ssf296o8m.apps.googleusercontent.com',
  aud: '373713270678-0dro9nrh86tlpcse6a4bia0ssf296o8m.apps.googleusercontent.com',
  sub: '100845670125144447963',
  email: 'butgha91826@gmail.com',
  email_verified: true,
  at_hash: '67Omv-_J7jS8D8T9-1lGew',
  name: 'Slayer Badre II',
  picture: 'https://lh3.googleusercontent.com/a/ACg8ocLc25B6tPSVUUtGeq6Twiosmyf91OgVqOvhEympDON-oBqKv-s=s96-c',
  given_name: 'Slayer',
  family_name: 'Badre II',
  iat: 1746814427,
  exp: 1746818027
    } 
 */

export default oauth2google