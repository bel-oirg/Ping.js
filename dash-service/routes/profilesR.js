import PC from "../controllers/profilesC.js"

const profilesR = (fastify, options, done) => {

    fastify.get('/get_card/', PC.profilesC)
    fastify.get('/search/', PC.searchC)
    fastify.post('/change-password/', PC.changePassC)
    
    done()
}

export default profilesR