import { gameStatsC, getGameHistoryC, getChartStatsC } from '../controllers/gameStatsC.js'

const gameStatsR = (fastify, options, done) => {

	const gameStatsSchema = {
		schema: {
			query: {
				type: 'object',
				properties: {
					limit: { type: 'integer', minimum: 1, maximum: 999 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						games: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'string' },
									username: { type: 'string' },
									avatar: { type: 'string' },
									myScore: { type: 'string' },
									opponentscore: { type: 'string' },
									created_at: { type: 'string' }
								}
							}
						},
						winRate: { type: 'number' },
						wins: { type: 'integer' },
						losses: { type: 'integer' }
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
		handler: gameStatsC
	}

/**
 * const gameHistorySchema = {
  querystring: {
    type: 'object',
    required: ['accountID'],
    properties: {
      accountID: { type: 'string' },
      limitCount: { type: 'integer', minimum: 1, default: 4 },
      offset: { type: 'integer', minimum: 0, default: 0 }
    }
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          avatar: { type: 'string', nullable: true },
          myScore: { type: 'integer' },
          opponentscore: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  handler: getGameHistoryC
}

 */



	fastify.get('/api/dash/game-stats/', gameStatsSchema)
	fastify.get('/api/dash/get-game-history/', getGameHistoryC)
	fastify.get('/api/dash/get-game-charts/', getChartStatsC)

	done()
}

export default gameStatsR