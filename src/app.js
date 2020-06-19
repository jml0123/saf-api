require('dotenv').config();
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")
const {NODE_ENV, CLIENT_ORIGIN} = require("./config")




const curatorsRouter = require('./curators/curators-router')
const messagesRouter = require('./messages/messages-router')
const subscribersRouter = require('./subscribers/subscribers-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors({
    origin: CLIENT_ORIGIN
}))

app.use('/api/profiles', curatorsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/subscribers', subscribersRouter)

// place functions here
 app.get('/', (req, res) => {
   res.json({ok: true});
 });
 
app.use(function errorHandler(error, req, res, next){
    let response
    if (NODE_ENV === "Production") {
        response = {error: {message: "Server error."}}
    }
    else {
        console.error(error);
        response = { message : error.message, error }
    }
    res.status(500).json(response)
})



module.exports = app