const path = require('path')
const express = require('express')
const xss = require('xss')
const CuratorsService = require('./curators-service')
const {requireAuth} = require('../middleware/require-auth')

const curatorsRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id: user.id,
    username: xss(user.username),
    phone_number: user.phone_number,
    full_name: xss(user.full_name),
    profile_img_link: user.profile_img_link,
    profile_description: user.profile_description,
    date_created: user.date_created
})

curatorsRouter
    .route("/")
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        CuratorsService.getAllCurators(knexInstance)
        .then(curators => {
            res.json(curators.map(serializeUser))    
        })
        .catch(next)
    })

curatorsRouter
    .route('/:curator_id')
    .all((req, res, next) => {
        knexInstance = req.app.get('db')
        CuratorsService.getByCuratorId(knexInstance, req.params.curator_id)
        .then(curator => {
            if (!curator) {
                return res.status(404).json({
                    error: { message: `Profile doesn't exist`}
                })
            }
            res.curator = curator
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeUser(res.curator))
    })
    .delete(requireAuth, (req, res, next) => {
        CuratorsService.deleteCurator(knexInstance, req.params.curator_id)
        .then(AffectedEntries=> {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const {username, password, full_name, profile_img_link, profile_description} = req.body;
        const updatedUser = {full_name, profile_img_link, profile_description}

        CuratorsService.updateUser(knexInstance, req.params.curator_id, updatedUser)
        .then(user => {
            res.status(200)
            res.json(serializeUser(user));
        })
        .catch(next)
    })

    module.exports = curatorsRouter