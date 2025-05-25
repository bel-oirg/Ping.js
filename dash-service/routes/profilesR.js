import profilesC from "../controllers/profilesC.js"

const profilesR = (fastify, options, done) => {

    fastify.get('/get_card/',
        {
            onRequest: [fastify.authenticate]
        },profilesC
    )
    done()
}

export default profilesR