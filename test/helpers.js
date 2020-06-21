const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

function makeCuratorsArray() {
  return [
    {
        id: 1,
        username: 'test-user-1',
        password: 'password',
        full_name: 'Test user 1',
        profile_img_link: "https://pmcdeadline2.files.wordpress.com/2019/12/orlando-bloom.jpg?w=1000",
        profile_description: "Hi I'm orlando bloom",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
        id: 2,
        username: 'test-user-2',
        password: 'password',
        full_name: 'Test user 2',
        profile_img_link: "https://pmcdeadline2.files.wordpress.com/2019/12/orlando-bloom.jpg?w=1000",
        profile_description: "Hi I'm orlando bloom 2",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
      },
    {
        id: 3,
        username: 'test-user-3',
        password: 'password',
        full_name: 'Test user 3',
        profile_img_link: null,
        profile_description: null,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
        id: 4,
        username: 'test-user-3',
        password: ' bad pass',
        full_name: 'Test user 3',
        profile_img_link: null,
        profile_description: null,
        date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeMessagesArray(users) {
  return [
    {
        id: 1,
        curator_id: users[0].id,
        scheduled: '2029-01-22T16:28:32.615Z',
        date_modified:  moment().seconds(0).milliseconds(0).toISOString(),
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
        id: 2,
        curator_id: users[1].id,
        scheduled: '2029-01-22T16:28:32.615Z',
        date_modified: moment().seconds(0).milliseconds(0).toISOString(),
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
        id: 3,
        curator_id: users[2].id,
        scheduled: '2029-01-22T16:28:32.615Z',
        date_modified:  moment().seconds(0).milliseconds(0).toISOString(),
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
        id: 4,
        curator_id: users[3].id,
        scheduled: '2029-01-22T16:28:32.615Z',
        date_modified:  moment().seconds(0).milliseconds(0).toISOString(),
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ]
}

function makeSubscribersArray(users) {
  return [
    {
        phone_number: '1112223333',
        curator_id: 1
    },
    {
        phone_number: '1112223333',
        curator_id: 2
    },
    {
        phone_number: '1112223333',
        curator_id: 3
    },
    {
        phone_number: '1112223333',
        curator_id: 4
    },
  ];
}

function makeExpectedMessage(users, message) {
  const curator = users
    .find(user => user.id === message.curator_id)

  return {
    id: message.id,
    content: message.content,
    scheduled: message.scheduled,
    curator_id: message.curator_id,
    date_modified:  moment().seconds(0).milliseconds(0).toISOString()
  }
}

function makeMaliciousMessage(user) {
    const maliciousMessage = {
      id: 911,
      scheduled: '2029-01-22T16:28:32.615Z',
      curator_id: user.id,
      content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedMessage = {
      ...makeExpectedMessage([user], maliciousMessage),
      content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousMessage,
        expectedMessage,
    }
  }

function makeMessagesFixtures() {
  const testUsers = makeCuratorsArray()
  const testMessages = makeMessagesArray(testUsers)

  return { testUsers, testMessages }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        curators,
        messages,
        subscribers
      `
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('curators').insert(preppedUsers)
}

function seedMessages(db, users, messages) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('messages').insert(messages)
  })
}

function seedMaliciousMessage(db, user, message) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('messages')
        .insert([message])
    )
}

function makeAuthHeader(curator, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ id: curator.id }, secret, {
    subject: curator.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeCuratorsArray,
  makeMessagesArray,
  makeExpectedMessage,
  makeMaliciousMessage,
  makeSubscribersArray,
  makeMessagesFixtures,
  cleanTables,
  seedMessages,
  seedMaliciousMessage,
  makeAuthHeader,
  seedUsers,
}