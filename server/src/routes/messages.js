const { Router } = require('express')
const { sendMessage, subNewMessage } = require('../controllers/messages')

const routes = Router()

// routes.get('/', subNewMessage)
// routes.post('/', sendMessage)

module.exports = routes