const { Router } = require('express')
const messagesRoute = require('./messages')


const routes = Router()

routes.use('/message', messagesRoute)

module.exports = routes