import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const USER1 = 'buddha'
const EMAIL1 = 'buddha@hotmail.com'

const USER2 = 'buddha2'
const EMAIL2 = 'buddha2@hotmail.com'

describe ('Checking Notifications features', () => {

    let fastify, token1, token2, id1, id2;

    beforeAll( async() => {
        fastify = await appBuilder()
        await fastify.ready()

        await pool.query('DELETE FROM notifs;')
        await pool.query('DELETE FROM friends;')
        await pool.query('DELETE FROM player;')

        const user1 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER1, EMAIL1])

        const user2 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER2, EMAIL2])

        id1 = user1.rows[0].id
        id2 = user2.rows[0].id

        token1 = fastify.jwt.sign({id: id1})
        token2 = fastify.jwt.sign({id: id2})
    })

    afterAll( async() => {
        await fastify.close()
        
        await pool.query('DELETE FROM notifs;')
        await pool.query('DELETE FROM friends;')
        await pool.query('DELETE FROM player;')
        
        await pool.end()
    })

    afterEach(async() => {
        await pool.query('DELETE FROM notifs;')
        await pool.query('DELETE FROM friends;')
    })

    describe ('testing /send-req/ + notifications', () => {

        test('valid friend req + notif received', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            const check = await pool.query('SELECT sender, receiver, is_readen FROM notifs  \
                WHERE sender = $1 AND receiver = $2;', [id1, id2])

            expect(resp.statusCode).toBe(200)
            expect(check.rows[0].sender).toBe(id1)
            expect(check.rows[0].receiver).toBe(id2)
            expect(check.rows[0].is_readen).toBeFalsy()
        })


        test('valid friend req + notif seen', async () => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            const resp = await request(fastify.server)
            .get('/api/dash/notif/seen/')
            .set('Authorization', `Bearer ${token2}`)

            const check = await pool.query('SELECT sender, receiver, is_readen FROM notifs  \
                WHERE sender = $1 AND receiver = $2;', [id1, id2])

            expect(resp.statusCode).toBe(200)
            expect(check.rows[0].sender).toBe(id1)
            expect(check.rows[0].receiver).toBe(id2)
            expect(check.rows[0].is_readen).toBeTruthy()
        })

        test('valid friend req + notif list', async () => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            const resp = await request(fastify.server)
            .get('/api/dash/notif/limit4/')
            .set('Authorization', `Bearer ${token2}`)

            const check = await pool.query('SELECT sender, receiver, is_readen, notif_type FROM notifs  \
                WHERE sender = $1 AND receiver = $2;', [id1, id2])

            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject([{sender: id1, notif_type: 1, is_readen: false}]) //sender, type, is_readen, created_at
            expect(check.rows[0].sender).toBe(id1)
            expect(check.rows[0].receiver).toBe(id2)
            expect(check.rows[0].is_readen).toBeFalsy()
        })

    })
})