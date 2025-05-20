import pool from '../config/db.js'

export default async function(fastify, opts) {
    fastify.get(
        "/pp",
        // {
        //     onRequest: [fastify.authenticate]
        // },
        async function(request, reply) {
            return pool.query('SELECT NOW()')
        }
    )
}

