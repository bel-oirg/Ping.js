import StoreC from '../controllers/storeC.js'

const storeR = (fastify, options, done) => {

    fastify.post('/store/buy/', StoreC.buyC)
    fastify.get('/inventory/', StoreC.list_inventoryC)

    done()
}

export default storeR