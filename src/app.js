const express = require('express')
const cors = require('cors')
const { Server } = require('http')

const routes = require('./routes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1', routes)

const server = Server(app)

server.listen('5006', ()=>{
  console.log(`Servidor iniciado http://127.0.0.1:5006/api/v1`);
})