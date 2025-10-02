import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'
import insertQR from './qrCode.js'
import dp from '../services/profilesS.js'

const newGameConsumer = async (message) => {
	const { id1, id2, points1, points2 } = JSON.parse(message.value)

	let winnerID = id1;

	if (points2 > points1)
		winnerID = id2;

	console.log(id2, id1)

	const { rank, level, exp } = (await pool.query('SELECT rank, level, exp FROM player WHERE id = $1', [winnerID])).rows[0]
	let { min_exp, max_exp, reward } = (await pool.query('SELECT min_exp, max_exp, reward FROM levels WHERE id = $1', [level])).rows[0]

	const calculatedXP = (max_exp - min_exp) / 3 + Math.abs(points1 - points2) * (level * 3)


	if (exp + calculatedXP >= max_exp && level < 20) {
		await pool.query('UPDATE player \
            SET level = level + 1, budget = budget + $1 \
            WHERE id = $2', [reward, winnerID])
	}

	let rankResult = (await pool.query('SELECT min_exp, max_exp, reward FROM ranks WHERE id = $1', [rank])).rows[0]

	if (exp + calculatedXP >= rankResult.max_exp && rank < 5) {
		await pool.query('UPDATE player \
            SET rank = rank + 1, budget = budget + $1 \
            WHERE id = $2', [rankResult.reward, winnerID])
	}

	await pool.query('UPDATE player \
        SET exp =  exp + $1, budget = budget + $3 \
        WHERE id = $2', [Math.round(calculatedXP), winnerID, Math.abs(points1 - points2) * (level * rank * 5)])
}

const updateStats = async (message) => {
	const { id1, id2, points1, points2, date} = JSON.parse(message.value)

	await pool.query('INSERT INTO playerstats(player1, player2, score1, score2, created_at) \
        VALUES($1, $2, $3, $4, $5);', [id1, id2, points1, points2, date])
}

const newUserConsumer = async (message) => {
	let { id, username, email, first_name, last_name, is_oauth, otp_secret, avatar} = JSON.parse(message.value)

	if (!avatar)
		avatar = '/data/avatars/default.png'

	await pool.query('INSERT INTO player(id, username, email, \
		first_name, last_name, is_oauth, otp_secret, avatar)  \
        VALUES($1, $2, $3, $4, $5, $6, $7, $8);',
		[id, username, email, first_name, last_name, is_oauth, otp_secret, avatar])
	
	await insertQR(id)
	await dp.resetCliTokenS(id)
}

const kafkaConsumer = async (fastify) => {
	try { 
		const consumer = kafka.consumer({ groupId: 'dash-grp' })

		await consumer.connect()
		await consumer.subscribe({ topic: 'newUser'})
		await consumer.subscribe({ topic: 'newGame'})


		await fastify.addHook('onClose', async () => {
			try
			{
				await consumer.disconnect()
			}
			catch(err)
			{
				console.log('[KAFKA] err disconnecting')
			}
		})

		consumer.run({
			eachMessage: async ({ topic, message }) => {
				try
				{
					if (topic == 'newUser') {
						await newUserConsumer(message)
					}
					else if (topic == 'newGame') {
						await newGameConsumer(message)
						await updateStats(message)
					}
				}
				catch(err)
				{
					console.log(`[KAFKA] Error processing message: ${err}`)
				}
			},
		})

	}
	catch (err) {
		console.log(`[KAFKA] ${err}`)
	}
}

export default kafkaConsumer