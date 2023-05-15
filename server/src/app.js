const express = require('express')
const cors = require('cors')
// const { Server } = require('http')

const fetch = require('node-fetch')
global.fetch = fetch

const routes = require('./routes')
// const { subNewMessage } = require('./controllers/messages')
require('./controllers/gmail')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1', routes)

// const server = Server(app)
// subNewMessage()

app.listen('5006', ()=>{
  console.log(`Servidor iniciado http://127.0.0.1:5006/api/v1`);
})