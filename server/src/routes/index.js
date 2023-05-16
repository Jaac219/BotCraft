const { Router } = require('express')
// const messagesRoute = require('./messages')
const gmailRoute = require('./gmail')


const routes = Router()

// routes.use('/message', messagesRoute)
routes.use('/mail', gmailRoute)

module.exports = routes