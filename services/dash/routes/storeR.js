import StoreC from '../controllers/storeC.js'

const storeR = (fastify, options, done) => {

    const buySchema = {
        schema: {
          body: {
            type: 'object',
            required: ['item_id', 'item_type'],
            properties: {
              item_id: { type: 'integer', minimum: 1, maximum: 100 },
              item_type: { type: 'integer', minimum: 1, maximum: 3 }
            },
            additionalProperties: false
          },
          response: {
            200: { type: 'null' },
            '4xx': {
              type: 'object',
              properties: {
                Error: { type: 'string' }
              },
            }
          }
        }
      }
      

    const inventorySchema = {
        schema:
        {
            response:
            {
                '200': { 
                    type: 'object',
                    properties: {
                        inventory: { 
                            type: 'array', 
                            items: { 
                                type: 'object',
                                properties: {
                                    item_id: { type: 'string' }, 
                                    item_type: { type: 'string' },
                                    is_equipped: { type: 'string' }
                                }
                            }
                        },
                        coins: { type: 'number' }
                    }
                },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: StoreC.list_inventoryC
    }

    fastify.post('/api/dash/store/equip/', buySchema, StoreC.equipC)
    fastify.get('/api/dash/inventory/', inventorySchema)
    
    fastify.post('/api/dash/store/buy/', buySchema, StoreC.buyC)
    fastify.get('/api/dash/store/avatars/', StoreC.listStoreAvatarsC)
    fastify.get('/api/dash/store/backgrounds/', StoreC.listStoreBgsC)
    done()
}

export default storeR