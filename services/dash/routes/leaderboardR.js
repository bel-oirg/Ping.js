import leaderboardC from '../controllers/leaderboardC.js'

const leaderboardR = (fastify, options, done) => {

    const leaderboardSchema = {
        schema: {
          response: {
            200: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  username: { type: 'string' },
                  avatar: { type: 'string' },
                  rank: { type: 'integer' },
                  level: { type: 'integer' },
                  exp: { type: 'integer' },
                  level_limits: {
                    type: 'object',
                    properties: {
                      min_exp: { type: 'integer' },
                      max_exp: { type: 'integer' }
                    },
                    required: ['min_exp', 'max_exp']
                  }
                },
                required: ['id', 'username', 'avatar', 'rank', 'level', 'exp', 'level_limits']
              }
            },
            '4xx': {
              type: 'object',
              properties: {
                Error: { type: 'string' }
              }
            }
          }
        },
        handler: leaderboardC
      }
      

    fastify.get('/api/dash/leaderboard/', leaderboardSchema)

    done()
}

export default leaderboardR