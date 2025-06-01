import forgetPassC from "../controllers/forgetPassC.js"

const forgetPassR = (fastify, options, done) => {

    fastify.post('/send-mail/', forgetPassC.send_mail)
    fastify.post('/forget-pass/', forgetPassC.forget_passC)

    done()
}

export default forgetPassR