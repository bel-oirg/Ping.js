import googleC from '../controllers/googleC.js'
import {OAuth2Client} from 'google-auth-library'


const oauth2google = (fastify, options, done) => {

    fastify.register(import ('@fastify/jwt'),
    {secret: process.env.JWT_SECRET,
    sign: {expiresIn:'4h'}})

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
        handler: googleC(fastify)
    }

    fastify.get('/oauth/google/', oauthGoogleSchema) 

    fastify.get('/google/',(_, res) => {

        const oauth2C = new OAuth2Client({
            clientId: process.env.CLIENT_ID_GOOGLE,
            clientSecret: process.env.CLIENT_SECRET_GOOGLE,
            redirectUri: process.env.GOOGLE_REDIRECT
        })

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