const path = require('path')
const express = require('express')
const xss = require('xss')
const MessagesService = require('./messages-service')

const messagesRouter = express.Router()
const jsonParser = express.json()

const serializeMessage = msg => ({
    id: msg.id,
    content: xss(msg.content),
    curator_id: msg.curator_id,
    scheduled: msg.scheduled,
    date_modified: msg.date_modified
})

messagesRouter
    .route("/")
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
        const newMessage = {content, scheduled, curator_id}
        for (const [key, value] of Object.entries(newMessage)) {
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
        })}

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
    .delete((req, res, next) => {
        MessagesService.deleteMessage(knexInstance, req.params.message_id)
        .then(AffectedEntries=> {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
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
.get((req, res, next) => {
    const knexInstance = req.app.get('db')
    MessagesService.getAllMessagesByCuratorId(knexInstance, req.params.curator_id)
    .then(messages => {
        if (!messages.length) {
            return res.status(404).json({
                error: { message: `User doesn't exist or no messages have been posted`}
            })
        }
        res.json(messages.map(serializeMessage))
    })
    .catch(next)
})


module.exports = messagesRouter