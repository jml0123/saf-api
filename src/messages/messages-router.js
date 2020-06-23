const path = require('path')
const express = require('express')
const xss = require('xss')
const MessagesService = require('./messages-service')
const {requireAuth} = require('../middleware/require-auth')

const messagesRouter = express.Router()
const jsonParser = express.json()

const serializeMessage = msg => ({
    //id: msg.id,
    content: xss(msg.content),
    curator_id: msg.curator_id,
    scheduled: msg.scheduled,
    //date_modified: msg.date_modified
})

messagesRouter
    .route("/")
    .all(requireAuth)
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        MessagesService.getAllMessages(knexInstance)
        .then(messages => {
            res.json(messages.map(serializeMessage))    
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next)=> {
        const knexInstance = req.app.get('db')
        const {content, scheduled, curator_id} = req.body;
        const newMessage = {content, scheduled}
        for (const [key, value] of Object.entries(newMessage)) {
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
        })}

        newMessage.curator_id = req.curator.id

        MessagesService.insertMessage(knexInstance, newMessage)
        .then(message => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${message.id}`))
                .json(serializeMessage(message))
        })
        .catch(next)
    })


messagesRouter
    .route('/:message_id')
    .all(requireAuth)
    .all((req, res, next) => {
        knexInstance = req.app.get('db')
        MessagesService.getByMessageId(knexInstance, req.params.message_id)
        .then(msg => {
            if (!msg) {
                return res.status(404).json({
                    error: { message: `Message doesn't exist`}
                })
            }
            res.msg = msg
            next()
        })
        .catch(next)
    })
    // REMOVE THIS ENDPOINT AFTER TESTING!
    .get((req, res, next) => {
        res.json(serializeMessage(res.msg))
    })
    .delete(requireAuth, (req, res, next) => {
        MessagesService.deleteMessage(knexInstance, req.params.message_id)
        .then(AffectedEntries=> {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const {content, scheduled} = req.body;
        const updatedMessage = {content, scheduled}

        if (updatedMessage.content  === null && updatedMessage.scheduled  === null)
            return res.status(400).json({
                error: { message: `Must update message content or schedule` }
        })
        updatedMessage.content = content
        updatedMessage.scheduled = scheduled

        MessagesService.updateMessage(knexInstance, req.params.message_id, updatedMessage)
        .then(numRowsAffected => {
            res.status(204).end();
        })
        .catch(next)
    })

messagesRouter
.route('/curator/:curator_id')
.all(requireAuth)
.get((req, res, next) => {
    const knexInstance = req.app.get('db')
    curator_id = req.curator.id
    MessagesService.getAllMessagesByCuratorId(knexInstance, curator_id)
    .then(messages => {
        res.json(messages.map(serializeMessage))
    })
    .catch(next)
})


module.exports = messagesRouter