const path = require('path')
const express = require('express')

const {requireAuth} = require('../middleware/require-auth')
const AuthService = require('../auth/auth-service')
const UsersService = require('./users-service')

const jsonParser = express.json()
const userRouter = express.Router()



userRouter
    .route('/')
    .get(requireAuth, (req, res, next) => {
          console.log("curator ====>" + req.curator)
          res.json(req.curator)
        }
    )
    .post(jsonParser, (req, res, next) => {
        const {username, password, full_name, profile_img_link, profile_description} = req.body
        const requiredFields = ['username', 'password', 'full_name']
        
        const profileImg = (!profile_img_link) ? null : profile_img_link
        const profileDescription = (!profile_description) ? null : profile_description

        for (const field of requiredFields) 
            if(!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })

        const passwordError = UsersService.validatePassword(password)

        if(passwordError)
            return res.status(400).json({ error: passwordError})
        
        
        UsersService.hasUserWithUserName(
            req.app.get('db'),
            username
        ).then(hasUserWithUserName => {
            if (hasUserWithUserName)
                return res.status(400).json({ error: 'Username already exists'})
            
            return UsersService.hashPassword(password)
                .then(hashedPassword => {
                    const newUser = {
                        username,
                        password: hashedPassword,
                        full_name,
                        profile_description: profileDescription,
                        profile_img_link: profileImg
                    } 
                    return UsersService.insertUser(
                        req.app.get('db'),
                        newUser
                    )
                    .then(curator => {
                        res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${curator.id}`))
                        .json(UsersService.serializeUser(curator))
                    })
                })
            })
            .catch(next)
    })
module.exports = userRouter