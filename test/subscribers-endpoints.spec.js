const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')

describe('Subscribers Endpoints', function() {
    //need to add unsubscribe test

  let db

  const {testUsers, testSubscribers} = helpers.makeSubscribersFixtures()

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

  describe(`GET /api/subscribers`, () => {
    context(`Given no subscribers`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/subscribers')
          .expect(200, [])
      })
    })

    context('Given there are subscribers in the database', () => {
      beforeEach('insert subscribers', () =>
        helpers.seedSubscribers(
            db,
            testUsers,
            testSubscribers
        )
      )

      it('responds with 200 and all of the subscribers', () => {
        const expectedSubscribers = testSubscribers.map(expectedSub =>
          helpers.makeExpectedSubscriber(
            testUsers,
            expectedSub
          )
        )
        return supertest(app)
          .get('/api/subscribers')
          .expect(200, expectedSubscribers)
      })
    })
  })
  // Get subcribers by user id needs to be added
})