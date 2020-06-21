const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
    hasUserWithUserName(db, username) {
        return db('curators')
            .where({ username })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('curators')
            .returning('*')
            .then(([user]) => user)
    },
    validatePassword(password) {
      if (password.length < 8) {
        return 'Password must be longer than 8 characters'
      }
      if (password.length > 72) {
        return 'Password must be less than 72 characters'
      }
      if (password.startsWith(' ') || password.endsWith(' ')) {
        return 'Password must not start or end with empty spaces'
      }
      // Make another check for simple passwords (need to have upper, lower, special and number)
      return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(curator) {
        return {
            id: curator.id,
            username: xss(curator.username),
            full_name: xss(curator.full_name),
            profile_img_link: xss(curator.profile_img_link),
            profile_description: xss(curator.profile_description)
        }
    }
  }
  
  module.exports = UsersService