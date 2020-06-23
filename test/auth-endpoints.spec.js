const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')


describe('Auth/Login Endpoints', function() {
  let db

  const testUsers = helpers.makeCuratorsArray()

  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('POST /api/auth/login', () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
            db, 
            testUsers
        )
      )
      const requiredFields = ['username', 'password', 'full_name']

      requiredFields.forEach(fields => {
          const loginAttemptBody = {
            username: testUser.username,
            password: testUser.password
          }
      })

      it('responds with 200 and JWT auth token using secret when credentials are valid - the happy path', () => {
          const validNewUser = {
              username: testUser.username,
              password: testUser.password,
              full_name: testUser.full_name
          }
          const expectedToken = jwt.sign(
                {id: testUser.id},
                process.env.JWT_SECRET,
                {  
                    subject: testUser.username,
                    algorithm: 'HS256'
                }
          )
          return supertest(app)
          .post('/api/auth/login')
          .send(validNewUser)
          .expect(200, {
              authToken: expectedToken
          })
      })
  })
})
