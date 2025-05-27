import profilesC from "../controllers/profilesC.js"

const profilesR = (fastify, options, done) => {

    fastify.get('/get_card/', profilesC)
    
    done()
}

export default profilesR