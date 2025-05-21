import pool from '../config/db.js'

export default async function(fastify) {
    fastify.get(
        "/pp",
        // {
        //     onRequest: [fastify.authenticate]
        // },
        async () => {
            return pool.query('SELECT * FROM account')
        }
    )
}

