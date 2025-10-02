import googleC from '../controllers/googleC.js'
import { OAuth2Client } from 'google-auth-library'


const oauth2google = (fastify, options, done) => {

	const oauthGoogleSchema = {
		schema:
		{
			querystring:
			{
				type: 'object',
				required: ['code'],
				properties: { code: { type: 'string' } }
			},
			response:
			{
				'200':
				{
					type: 'object',
					properties: { token: { type: 'string' } }
				},
				'4xx':
				{
				    type:'object',
				    properties:
				    {
				        Error:{type:'string'}
				    }
				}
			}
		},
		// handler: googleC(fastify)
		handler: async (req, res) => {
			try {
				const controller = googleC(fastify)
				const getToken = () => new Promise((resolve, reject) => {
					controller(req, {
						status: (statusCode) => {
							if (statusCode === 200) {
								return {
									send: (data) => {
										resolve(data)
									}
								}
							} else {
								return {
									send: (error) => {
										reject(new Error(error.Error || 'Authentication failed'))
									}
								}
							}
						}
					})
				})

				const responseData = await getToken()
				if (responseData) {
					if (responseData.token) {
						return res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/login?token=${responseData.token}`)
					} else if (responseData.otp_token) {
						return res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/login?otp_token=${responseData.otp_token}`)
					}
				}
				throw new Error('No token returned from authentication')
			} catch (err) {
				return res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/login`)
			}
		}
	}

	fastify.get('/api/auth/oauth/google/', oauthGoogleSchema)
	fastify.get('/api/auth/google/', (_, res) => {
		try
		{
			const oauth2C = new OAuth2Client({
				clientId: process.env.CLIENT_ID_GOOGLE,
				clientSecret: process.env.CLIENT_SECRET_GOOGLE,
				redirectUri: process.env.GOOGLE_REDIRECT
			})
			if (!oauth2C) {
				res.status(400).send({ Error: 'Failed to create OAuth2 client' })
				return
			}

			const authURL = oauth2C.generateAuthUrl({
				access_type: 'offline',
				scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
				prompt: 'consent',
				include_granted_scopes: true
			})

			res.redirect(authURL)
		}
		catch(err)
		{
			return res.status(400)
		}
	})

	done()
}

export default oauth2google
