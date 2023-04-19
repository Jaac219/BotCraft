const axios = require("axios");

const { createClient } = require('graphql-ws');
const { WebSocket } = require('ws');
const { Configuration, OpenAIApi } = require('openai')

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const wtp = new Client();

(()=>{
  wtp.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    // Genera una URL QR que puedes escanear con la aplicación de WhatsApp en tu teléfono
    console.log('Por favor escanea este QR con la aplicación de WhatsApp en tu teléfono:', );
  });
  
  wtp.on('authenticated', (session) => {
    // Ya estamos autenticados y podemos enviar mensajes
    console.log('Autenticado correctamente!', );
  });
  
  wtp.on('ready', () => {
    // Ya estamos listos para enviar mensajes
    console.log('¡Listo para enviar mensajes!');
  });
  
  wtp.initialize();
})()

const params = {
  'x-token': '657258408adca3eef369247d52dd7e3e43f876cd7623d23e83c5917bdf5438a1c5b32d0be871dcf23c9edc09d3023f74522aed077d925877a32675dbfd196cdd',
  'x-secret': '12345abc'
}

const client = createClient({
  webSocketImpl: WebSocket,
  url: 'ws://127.0.0.1:22248/ws',
  connectionParams: params 
})

const configuration = new Configuration({
  apiKey: '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'
})

const chatGptMessage = async ({message}) => {
  try {
    const openai = new OpenAIApi(configuration)
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{role: 'user', content: message}]
    })

    return response?.data?.choices[0].message.content
  } catch (error) { 
    console.log(error);
  }
}

const sendMessage = async (dataInput)=>{
  try {
    const { pongMessage,  conversationId, receptorIds } = dataInput
    const { data } = await axios.post('http://localhost:22248/gql', {
      query: `mutation Mutation($message: String, $receptorIds: [String], $conversationId: String) {
        C_ValidateConversationAndInsert(message: $message, receptorIds: $receptorIds, conversationId: $conversationId)
      }`,
      variables:{
        message: pongMessage || 'no avalible message',
        receptorIds: receptorIds,
        conversationId: conversationId
      }
    }, { headers: params })
  } catch (error) {
    console.log(error);
  }
}

const sendTyping = async (dataInput)=>{
  try {
    const { conversationId, typing } = dataInput
    const { data } = await axios.post('http://localhost:22248/gql', {
      query: `mutation Mutation($typing: Boolean, $conversationId: String!) {
        C_Typing(typing: $typing, conversationId: $conversationId)
      }`,
      variables:{
        typing,
        conversationId
      }
    }, { headers: params })
  } catch (error) {
    console.log(error);
  }
}

const chatGptService = async({ message, conversationId, receptorIds }) =>{
  chatGptMessage({message}).then(async (pongMessage)=>{
    await sendMessage({ pongMessage,  conversationId, receptorIds})
    await sendTyping({ conversationId, typing: false })
  })

  await sendTyping({ conversationId, typing: true })
}

const wtpService = async({message})=>{
  try {
    let phone = message.match(/#(\d+)\s/)[1]
    console.log(phone)
    message = message.replace(`#${phone}`, '')
    wtp.sendMessage(`${phone}@c.us`, message);
  } catch (error) {
    console.log(error);
  }
}

const subNewMessage = async () => {
  try {
    let initValMessages = {}
    const onNext = async (data) => {
      let { data : { C_NewNotification: { message, conversationId, receptorIds } } } = data
      
      /* Valida si la primera palabra del texto contiene un comando 
      iniciado con '/' ejm: /chatGpt y lo devuelve '/chatGpt' 
      de lo contrario devuelve false */
      
      let opt = !!message.match(/^\/\S*/) ? message.match(/^\/\S*/)[0] : ''
      if(!opt && initValMessages[conversationId]) opt = initValMessages[conversationId]

      // if(opt && initialize[conversationId]){
      //   if(opt != initialize[conversationId]){
          
      //   }
      // }
      
      switch (opt) {
        case '/chatGpt':
          if(message.indexOf('/chatGpt ') !== -1){
            message = message.replace('/chatGpt ', '')
          }
          console.log(message);
          chatGptService({ message, conversationId, receptorIds })
          initValMessages[conversationId] = '/chatGpt'
          break;
        
        case '/wtp':
          if(message.indexOf('/wtp ') !== -1){
            message = message.replace('/wtp ', '')
          }
          console.log(message);
          wtpService({message})
          initValMessages[conversationId] = '/wtp'
          break
      
        default:
          break;
      }
    };

    const query = `subscription Subscription {
      C_NewNotification {
        _id
        conversationId
        message
        receptorIds
      }
    }`;

    client.subscribe({ query }, { next: onNext })

  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendMessage,
  subNewMessage
}