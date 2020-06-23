const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')
const xss = require('xss')

describe('Messages Endpoints', function() {
  let db

  const serializeMessage = msg => ({
    //id: msg.id,
    content: xss(msg.content),
    curator_id: msg.curator_id,
    scheduled: msg.scheduled,
    //date_modified: msg.date_modified
})

    
  const {
    testUsers,
    testMessages,
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

  describe(`GET /api/messages`, () => {
    context(`Given no messages`, () => {
     beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/messages')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, [])
      })
    })
    context('Given there are messages in the database', () => {
      beforeEach('insert messages', () =>
        helpers.seedMessages(
          db,
          testUsers,
          testMessages
        )
      )
      it('responds with 200 and all of the messages', () => {
        const expectedMessages = testMessages.map(messages =>
          helpers.makeExpectedMessage(
            testUsers,
            messages
          )
        )
        return supertest(app)
          .get('/api/messages')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedMessages.map(msg=>serializeMessage(msg)))
      })
    })

    context(`Given an XSS attack message`, () => {
        const {
            maliciousMessage,
            expectedMessage,
    } = helpers.makeMaliciousMessage(testUser)

      beforeEach('insert malicious message', () => {
        return helpers.seedMaliciousMessage(
          db,
          testUser,
          maliciousMessage,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/messages`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].content).to.eql(expectedMessage.content)
          })
      })
    })
  })


  describe(`POST /messages`, () => {
    context(`Given a specific curator`, () => {
        beforeEach(() =>
            helpers.seedUsers(db, testUsers)
        )
        const goodMessage = {
            content: "Lorem ipsum",
            scheduled: "2029-01-22T16:28:32.615Z",
            curator_id: testUser.id
        }
        
        it('Successfully adds message associated with the given curator', () => {
            return supertest(app)
              .post(`/api/messages`)
              .send(goodMessage)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(201, serializeMessage(goodMessage))
          })
    })
  })

  describe(`GET /messages/curator/:curator_id`, () => {
    context(`Given a specific curator`, () => {
        beforeEach(() =>
            helpers.seedMessages(db, testUsers, testMessages)
        )
        const expectedMessages = testMessages.filter(message => message.curator_id === testUser.id)

        it('Successfully retrieves messages associated with the given curator', () => {
            return supertest(app)
              .get(`/api/messages/curator/${testUser.id}`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(200, expectedMessages.map(message => serializeMessage(message)))
          })
    })
  })


  describe(`GET /api/messages/:message_id`, () => {
    context(`Given no messages`, () => {
      beforeEach(() =>
        helpers.seedMessages(db, testUsers, testMessages)
      )
      it(`responds with 404`, () => {
        const messageId = 213129312
        return supertest(app)
          .get(`/api/messages/${messageId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, {error: {
              message: `Message doesn't exist`
            }}
          )
        })
    })
    context('Given there are messages in the database', () => {
      beforeEach('insert messages', () =>
        helpers.seedMessages(
          db,
          testUsers,
          testMessages
        )
      )
      it('responds with 200 and the specified message', () => {
        const messageId = 3
        const expectedMessage = helpers.makeExpectedMessage(
          testUsers,
          testMessages[messageId - 1]
        )
        return supertest(app)
          .get(`/api/messages/${messageId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, serializeMessage(expectedMessage))
      })
    })

    context(`Given an XSS attack message`, () => {
      const testUser = helpers.makeCuratorsArray()[1]
      const {
        maliciousMessage,
        expectedMessage,
      } = helpers.makeMaliciousMessage(testUser)
      beforeEach('insert malicious message', () => {
        return helpers.seedMaliciousMessage(
          db,
          testUser,
          maliciousMessage,
        )
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/messages/${maliciousMessage.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.content).to.eql(expectedMessage.content)
          })
      })
    })
  })
})