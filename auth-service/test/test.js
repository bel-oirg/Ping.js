import assert from 'assert'
import setupdb from '../config/setupDB.js';
import * as chai from 'chai'
import chaiHttp from 'chai-http'
import pool from '../config/db.js';



describe('Connection', function () {
  before(async () => {
    //create test db if not exist
    await setupdb()
    
    //connect into db
    await pool.connect()
    .then(() => {
        console.log('[DB] connection is good')
    })
    .catch((err) => {
        console.error('[DB] Unable to connect to db :', err);
    })
  
    //load the tables into db
    const query = fs.readFileSync('./models/Account.sql', 'utf-8')
    await pool.query(query)

    //insert a test user
    const newone = await pool.query('INSERT INTO account (username, email, pass) VALUES ($1, $2, $3)', ['testuserrr', 'email2', 'anypass@;=-0'])
  })
  
  after(async () => {
    // await pool.query('DROP TABLE IF EXISTS account CASCADE;')
    await pool.end()
  })

  //i will write tests here 

});
