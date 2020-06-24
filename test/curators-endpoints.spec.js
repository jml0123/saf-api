const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')

const xss = require('xss')
const { test } = require('mocha')
const { serializeUser } = require('../src/users/users-service')

describe('Curators or Profiles Endpoints', function() {
  let db

  const testUsers = helpers.makeCuratorsArray()

  const testUser = testUsers[0]
  
  const serializeUser = user => ({
    id: user.id,
    username: xss(user.username),
    full_name: xss(user.full_name),
    profile_img_link: user.profile_img_link,
    profile_description: user.profile_description,
    date_created: user.date_created
})

  const listToScrub = testUsers.map(curator => {
      return {...curator}
  })
  listToScrub.forEach(curator => {
      delete curator.password
      return curator
  })

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

  describe(`GET /api/profiles`, () => {
    context(`Given no profiles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/profiles')
          .expect(200, [])
      })
    })

    context('Given there are curators in the database', () => {

      beforeEach('insert curators',() => 
         helpers.seedUsers(db, testUsers)
      )
      
      it('responds with 200 and all of the curators', () => {
        return supertest(app)
          .get('/api/profiles')
          .expect(200, testUsers.map(user => serializeUser(user)))
      })
    })
  })
  describe(`GET /api/profile/:profile_id`, () => {
    context(`Given no curator matches id`, () => {
      it(`responds with 404`, () => {
        const curatorId = 213129312
        return supertest(app)
          .get(`/api/profiles/${curatorId}`)
          .expect(404, {error: {
              message: `Profile doesn't exist`
            }}
          )
        })
    })
    context('Given there is matching curator in the database', () => {
        return supertest(app)
          .get(`/api/profiles/${testUser.id}`)
          .expect(200, serializeUser(testUser))
      })
  })
  describe(`PATCH /api/profiles/:profile_id`, () => {
    beforeEach('insert curators',() => 
      helpers.seedUsers(db, testUsers)
    )
    context('Given there is matching curator in the database', () => {
        // Do not support password or username yet
        const updatedData = {
          id: testUser.id,
          username: testUser.username,
          full_name:"new display name",
          profile_img_link: "updated link",
          profile_description: "updated description"
        }
        return supertest(app)
          .patch(`/api/profiles/${testUser.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, serializeUser(updatedData))
      })
  })
  describe(`DELETE /api/profiles/:profile_id`, () => {
    beforeEach('insert curators',() => 
      helpers.seedUsers(db, testUsers)
    )
    context('Given there is matching curator in the database', () => {
        // Do not support password or username yet
        it('Successfully deletes curator', () => {
          return supertest(app)
            .delete(`/api/profiles/${testUser.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(204) // Deleted
            .then(res=> {
              return supertest(app)
              .get(`/api/profiles/${testUser.id}`)
              .expect(404) 
            })
        })
    })
  })
}) 