import PC from "../controllers/profilesC.js"

const profilesR = (fastify, options, done) => {

    fastify.get('/api/dash/get-card/', PC.profilesC)
    fastify.get('/api/dash/search/', PC.searchC)
    fastify.post('/api/dash/change-password/', PC.changePassC)
    fastify.post('/api/dash/edit/', PC.editC)
    
    done()
}

export default profilesR