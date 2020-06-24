const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')

describe('Subscribers Endpoints', function() {
    
    const serializeSubscriber = subscriber => ({
        curator_id: subscriber.curator_id
    })

    let db

    const {testUsers, testSubscribers} = helpers.makeSubscribersFixtures()

    const testCurator = testUsers[0]
    const testSubscriber = testSubscribers[0]

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

    describe(`POST /api/subscribers`, () => {
        context('Successful addition of subscriber', () => {
            beforeEach('insert curators',() => 
                helpers.seedUsers(db, testUsers)
            )
            it(`responds 201, and the resulting curator_id subscribed to`, () => {
                const goodSubscriber = {
                    phone_number: '1111111111',
                    curator_id: 2,
                }
                return supertest(app)
                    .post('/api/subscribers')
                    .send(goodSubscriber)
                    .expect(201, serializeSubscriber(goodSubscriber))
            })
        })
    })
    describe(`GET /api/subscribers/:subscriber_id`, () => {
        context('When a subscriber exists in the db', () => {
            beforeEach('insert subscribers',() => 
                helpers.seedSubscribers(db, testUsers, testSubscribers)
            )
            it(`responds 200, and the serialized subscriber`, () => {
                return supertest(app)
                    .get(`/api/subscribers/${testSubscriber.id}`)
                    .expect(200, serializeSubscriber(testSubscriber))
            })
        })
    })
    describe(`DELETE /api/subscribers/:subscriber_id`, () => {
        context('When a subscriber exists in the db', () => {
            beforeEach('insert subscribers',() => 
                helpers.seedSubscribers(db, testUsers, testSubscribers)
            )
            it(`succesfully deletes the subscriber entry at the given id (phone numbers paired with other curators persist)`, () => {
                return supertest(app)
                    .delete(`/api/subscribers/${testSubscriber.id}`)
                    .expect(204)
                    .then(res =>{
                        return supertest(app)
                        .get(`/api/subscribers/${testSubscriber.id}`)
                        .expect(404)
                    })
            })
        })
    })
    describe(`GET /api/subscribers/curator/:curator_id`, () => {
        context('When a given curator has subscribers', () => {
            beforeEach('insert subscribers',() => 
                helpers.seedSubscribers(db, testUsers, testSubscribers)
            )
            const expectedCount= testSubscribers.filter(subscriber => subscriber.curator_id === testCurator.id).length
            const expectedResult = [{count: expectedCount.toString()}]

            it(`responds 200, and the serialized subscriber`, () => {
                return supertest(app)
                    .get(`/api/subscribers/curator/${testCurator.id}`)
                    .expect(200, expectedResult)
            })
        })
    })


    describe(`POST /api/subscribers/unsubscribe`, () => {
        context('Successful unsubscription of subscriber', () => {
            beforeEach('insert subscribers',() => 
                helpers.seedSubscribers(db, testUsers, testSubscribers)
            )
            it(`responds 200, and the resulting number of curators unsubscribed to`, () => {
                const deleteSubscriber = {
                    phone_number: testSubscriber.phone_number,
                }

                const expectedCount= testSubscribers.filter(subscriber => subscriber.phone_number === testSubscriber.phone_number).length

                return supertest(app)
                    .post('/api/subscribers/unsubscribe')
                    .send(deleteSubscriber)
                    .expect(200, {deleteCount: expectedCount})
                    .then(res => {
                        return supertest(app)
                            .get(`/api/subscribers/${testSubscriber.id}`)
                            .expect(404)
                    }) 
            })
        })
    })
})