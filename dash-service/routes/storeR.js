import StoreC from '../controllers/storeC.js'

const storeR = (fastify, options, done) => {

    fastify.post('/api/dash/store/buy/', StoreC.buyC)
    fastify.get('/api/dash/inventory/', StoreC.list_inventoryC)

    done()
}

export default storeR