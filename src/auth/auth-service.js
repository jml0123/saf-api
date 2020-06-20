const bcrypt = require('bcryptjs')

const AuthService = {
    getUserWithUserName(db, username) {
      return db('curators')
        .where({ username })
        .first()
    },
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },
    parseBasicToken(token) {
      return Buffer
        .from(token, 'base64')
        .toString()
        .split(':')
    },
    getUserID(db, username, password){
        return db('curators')
        .where({username, password})
        .first()
    }
  }
  
  module.exports = AuthService