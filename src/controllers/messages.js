const axios = require("axios");

const { createClient } = require('graphql-ws');
const { WebSocket } = require('ws');

const client = createClient({
  webSocketImpl: WebSocket,
  url: 'ws://127.0.0.1:22248/ws'
})

const sendMessage = async (req, res)=>{
  try {
    const headers = {
      'x-token': 'f0d7da573dc42eccccb05a4046e0af6efdfbfade4ec6c2352d8f6198cd7d5c89c9be9a878fecfec1f30c55b7383d380019b73f924fa9c0d0d4a3e27c36075689',
      'x-secret': '12345abc'
    }
    const { data } = await axios.post('http://localhost:22248/gql', {
      query: `mutation Mutation($message: String, $receptorIds: [String], $conversationId: String) {
        C_ValidateConversationAndInsert(message: $message, receptorIds: $receptorIds, conversationId: $conversationId)
      }`,
      variables:{
        message: req.message || 'rs',
        receptorIds: ["63ac61806571a4643214af38"],
        conversationId: "ZUrrFIyuyuPqpT4YO"
      }
    }, { headers })

    // res.json(data)
  } catch (error) {
    console.log(error);
  }
}

const subNewMessage = async (req, res) => {
  try {
    const onNext = async (data) => {
      console.log(data);
      const { data : { C_NewMessage: { message } } } = data
      if(message == 'ping') {
        req.message = 'pong'
        await sendMessage(req, res)
      }
    };

    const query = `subscription Subscription($conversationId: String!) {
      C_NewMessage(conversationId: $conversationId) {
        _id
        message
      }
    }`;

    const variables = {
      conversationId: "ZUrrFIyuyuPqpT4YO"
    }

    client.subscribe({ query, variables }, { next: onNext })

  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendMessage,
  subNewMessage
}