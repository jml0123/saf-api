const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')
const { test } = require('mocha')

describe('Curators or Profiles Endpoints', function() {
  let db

  const testUsers = helpers.makeCuratorsArray()

  const listToScrub = testUsers.map(curator => {
      return {...curator}
  })
  
  listToScrub.forEach(curator => {
      delete curator.password
      return curator
  })
  console.log(listToScrub)

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
          .expect(200, listToScrub)
      })
    })
  })

  describe(`GET /api/:profile_id`, () => {
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
        expectedCurator = listToScrub[0]
        return supertest(app)
          .get(`/api/profiles/${expectedCurator.id}`)
          .expect(200, expectedCurator)
      })
  })
})