const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')
const bcrypt = require('bcryptjs')
const xss = require('xss')

const serializeUserLogin = user => ({
    id: user.id,
    username: xss(user.username),
    full_name: xss(user.full_name),
    profile_img_link: user.profile_img_link,
    profile_description: user.profile_description,
    date_created: user.date_created
})


describe('Users Endpoints', function() {
  let db

  const {
    testUsers,
  } = helpers.makeMessagesFixtures()

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

  describe(`GET /api/users`, () => {
    context(`Get user using header token`, () => {
        beforeEach(() =>
           helpers.seedUsers(db, testUsers)
         )
           it(`responds with 200 when a successful request is made`, () => {
                return supertest(app)
                .get('/api/users')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200, serializeUserLogin(testUser))
         })
    })   
  })
  
  
  describe(`POST /api/users`, () => {
    // Still need to add test for xss attack content
    context(`Validation`, () => {
     beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      const requiredFields = ['username', 'password', 'full_name']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test username',
          password: 'test password',
          full_name: 'test full_name',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })

      it(`responds 400 'Password be longer than 8 characters' when less than 8 characters`, () => {
        const userShortPassword = {
          username: 'test username',
          password: '1234567',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: `Password must be longer than 8 characters` })
      })

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          username: 'test username',
          password: ' 1Aa!2Bb@',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          username: 'test username',
          password: '1Aa!2Bb@ ',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })
      it(`responds 400 'User name already taken' when username isn't unique`, () => {
        const duplicateUser = {
          username: testUser.username,
          password: '11AAaa!!',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: `Username already exists` })
      })
    })
    
    context(`Successful Registration - Happy Path`, () => {
        it(`responds 201, serialized user with all fields filled out, storing bcryped password`, () => {
          const newUser = {
            username: 'test username',
            password: '11AAaa!!',
            full_name: 'test full_name',
            profile_img_link: "some_link",
            profile_description: "some_description"
          }
          return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property('id')
              expect(res.body.username).to.eql(newUser.username)
              expect(res.body.full_name).to.eql(newUser.full_name)
              expect(res.body.profile_img_link).to.eql(newUser.profile_img_link)
              expect(res.body.profile_description).to.eql(newUser.profile_description)
              expect(res.body).to.not.have.property('password')
            })
            .expect(res =>
              db
                .from('curators')
                .select('*')
                .where({ id: res.body.id })
                .first()
                .then(row => {
                  expect(row.username).to.eql(newUser.username)
                  expect(row.full_name).to.eql(newUser.full_name)
  
                  return bcrypt.compare(newUser.password, row.password)
                })
                .then(compareMatch => {
                  expect(compareMatch).to.be.true
                })
            )
        })

        it(`responds 201, serialized user with with image and description fields null, storing bcryped password`, () => {
            const newUser = {
              username: 'test username',
              password: '11AAaa!!',
              full_name: 'test full_name',
              profile_img_link: null,
              profile_description: null
            }
            return supertest(app)
              .post('/api/users')
              .send(newUser)
              .expect(201)
              .expect(res => {
                expect(res.body).to.have.property('id')
                expect(res.body.username).to.eql(newUser.username)
                expect(res.body.full_name).to.eql(newUser.full_name)
                expect(res.body).to.not.have.property('password')
              })
              .expect(res =>
                db
                .from('curators')
                .select('*')
                .where({ id: res.body.id })
                .first()
                .then(row => {
                  expect(row.username).to.eql(newUser.username)
                  expect(row.full_name).to.eql(newUser.full_name)
                  expect(res.body.profile_img_link).to.eql('')
                  expect(res.body.profile_description).to.eql('')
                  return bcrypt.compare(newUser.password, row.password)
                })
                .then(compareMatch => {
                  expect(compareMatch).to.be.true
                })
              )
          })
      })
    })
  })