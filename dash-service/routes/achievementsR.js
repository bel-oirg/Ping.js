import ach from '../controllers/achievementsC.js'

const achievements = (fastify, options, done) => {

    fastify.post('/add-achievements/', ach.add_achievementsC)
    fastify.post('/update-achievements/', ach.update_achievementsC)
    fastify.get('/list-achievements/', ach.list_achievementsC)
    fastify.get('/all-achievements/', ach.all_achievementsC)

    done()
}

export default achievements