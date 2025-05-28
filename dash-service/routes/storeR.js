import StoreC from '../controllers/storeC.js'

const storeR = (fastify, options, done) => {

    fastify.get('/store/avatars/' ,StoreC.avatars)
    fastify.get('/store/emotes_packs/' ,StoreC.emotes_packs)
    fastify.get('/store/backgrounds/' ,StoreC.backgrounds)

    fastify.get('/store/buy/' ,StoreC.backgrounds)

    done()
}

export default storeR