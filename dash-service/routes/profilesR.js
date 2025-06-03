import PC from "../controllers/profilesC.js"

const profilesR = (fastify, options, done) => {

    fastify.get('/api/dash/get_card/', PC.profilesC)
    fastify.get('/api/dash/search/', PC.searchC)
    fastify.post('/api/dash/change-password/', PC.changePassC)
    //TODO add edit profile
    
    done()
}

export default profilesR