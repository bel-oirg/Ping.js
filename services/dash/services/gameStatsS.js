import pool from '../config/pooling.js'

export async function gameStatsS(accountID, limitCount = 4, offset = 0) {
	let allGames = await pool.query('SELECT \
        CASE WHEN player1 = $1 THEN player2 ELSE player1 END AS opponent ,       \
        CASE WHEN player1 = $1 THEN score1 ELSE score2 END AS myscore,         \
        CASE WHEN player1 = $1 THEN score2 ELSE score1 END AS opponentscore   \
		created_at \
        FROM playerStats WHERE player1 = $1 OR player2 = $1 \
        ORDER BY created_at DESC LIMIT $2 OFFSET $3;', [accountID, limitCount, offset])

	let winCount = 0
	allGames.rows.forEach((game) => {
		if (game.myscore > game.opponentscore)
			winCount += 1
	})

	allGames = await Promise.all(allGames.rows.map(async (element) => {
		let user_data = await pool.query('SELECT username, avatar FROM player \
			WHERE id = $1', [element.opponent])

		user_data = user_data.rows[0]

		return {
			id: element.opponent,
			username: user_data.username,
			avatar: user_data.avatar,
			myScore: element.myscore,
			opponentscore: element.opponentscore
		}
	}))

	return ({
		games: allGames,
		winRate: allGames.length ? Math.round((winCount * 100) / allGames.length) : 0,
		wins: winCount,
		losses: allGames.length - winCount
	})
}

export async function getGameHistoryS(accountID, limitCount = 4, offset = 0) {
	const check = await pool.query('SELECT EXISTS(SELECT 1 FROM player WHERE id = $1)', [accountID]) 

	if (check.rowCount == 0)
		throw new Error('User does not exists')

	let allGames = await pool.query('SELECT \
        CASE WHEN player1 = $1 THEN player2 ELSE player1 END AS opponent ,       \
        CASE WHEN player1 = $1 THEN score1 ELSE score2 END AS myscore,         \
        CASE WHEN player1 = $1 THEN score2 ELSE score1 END AS opponentscore,   \
		created_at \
        FROM playerStats WHERE player1 = $1 OR player2 = $1 \
        ORDER BY created_at DESC LIMIT $2 OFFSET $3;', [accountID, limitCount, offset])

	let winCount = 0
	allGames.rows.forEach((game) => {
		if (game.myscore > game.opponentscore)
			winCount += 1
	})

	allGames = await Promise.all(allGames.rows.map(async (element) => {
		let user_data = await pool.query('SELECT username, avatar FROM player \
			WHERE id = $1', [element.opponent])

		user_data = user_data.rows[0]

		return {
			id: element.opponent,
			username: user_data.username,
			avatar: user_data.avatar,
			myScore: element.myscore,
			opponentscore: element.opponentscore,
			created_at: element.created_at

		}
	}))
	return allGames
}


export async function getChartStatsS(accountID, interval) {
	let allGames;
	
	if (interval)
	{
		allGames = await pool.query("SELECT \
        CASE WHEN player1 = $1 THEN player2 ELSE player1 END AS opponent ,     \
        CASE WHEN player1 = $1 THEN score1 ELSE score2 END AS myscore,         \
        CASE WHEN player1 = $1 THEN score2 ELSE score1 END AS opponentscore,	\
		created_at   \
        FROM playerStats WHERE (player1 = $1 OR player2 = $1) \
		AND created_at > NOW() - INTERVAL '7 days';", [accountID])
		return allGames.rows
	}

	allGames = await pool.query("SELECT \
	CASE WHEN player1 = $1 THEN player2 ELSE player1 END AS opponent ,    	\
	CASE WHEN player1 = $1 THEN score1 ELSE score2 END AS myscore,        	\
	CASE WHEN player1 = $1 THEN score2 ELSE score1 END AS opponentscore,	\
	created_at FROM playerStats WHERE (player1 = $1 OR player2 = $1)", [accountID])

	let winCount = 0
	allGames.rows.forEach((game) => {
		if (game.myscore > game.opponentscore)
			winCount += 1
	})

	return {
		games: allGames.rows,
		winRate: allGames.rows.length ? Math.round((winCount * 100) / allGames.rows.length) : 0,
		wins: winCount,
		losses: allGames.rows.length - winCount
	}
}
