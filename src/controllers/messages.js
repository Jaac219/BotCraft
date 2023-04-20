const axios = require("axios");

const { createClient } = require('graphql-ws');
const { WebSocket } = require('ws');
const { Configuration, OpenAIApi } = require('openai')

const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');
const wtp = new Client({
  authStrategy: new LocalAuth()
});

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

const chaskyParams= {
  'x-token': '657258408adca3eef369247d52dd7e3e43f876cd7623d23e83c5917bdf5438a1c5b32d0be871dcf23c9edc09d3023f74522aed077d925877a32675dbfd196cdd',
  'x-secret': '12345abc'
}

const futurAppsParams = {
  'x-token': '2750d075b92dffdbc60939a45da7472f3b2058007e4a24668332fc26ddb111753d0a418257f7e1b5773fbb31ce18f42acfb8eba3975c9ce343dd8aa28bf2abc0',
  'x-secret': '12345abc'
}

const client = createClient({
  webSocketImpl: WebSocket,
  url: 'ws://127.0.0.1:22248/ws',
  connectionParams: chaskyParams
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
    }, { headers: chaskyParams})
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
    }, { headers: chaskyParams})
  } catch (error) {
    console.log(error);
  }
}

const getSupProjects = async () => {
  try {
    const { data } = await axios.post('http://10.2.20.113:25787/gql', {
      query: `query SUP_Project {
        SUP_Project {
          _id
          key
        }
      }`
    }, { headers: futurAppsParams})

    const { data: { SUP_Project }} = data
    return SUP_Project
  } catch (error) {
    console.log(error);
  }
}

const getSubTypes = async (projectKey) => {
  try {
    const { data } = await axios.post('http://10.2.20.113:25787/gql', {
      query: `query SUP_Type($filter: SUP_Type_filter) {
        SUP_Type(filter: $filter) {
          _id
          key
        }
      }`,
      variables: {
        filter: {
          projectKey
        }
      }
    }, { headers: futurAppsParams})

    const { data: { SUP_Type }} = data
    return SUP_Type

  } catch (error) {
    console.log(error);
  }
}

/// ---------------------------- services -----------------------------------

const chatGptService = async({ message, conversationId, receptorIds }) =>{
  chatGptMessage({message}).then(async (pongMessage)=>{
    await sendMessage({ pongMessage,  conversationId, receptorIds})
    await sendTyping({ conversationId, typing: false })
  })

  await sendTyping({ conversationId, typing: true })
}

let phone = ''
const wtpService = async({ message, conversationId, receptorIds })=>{
  try {
    let rgx = !!message.match(/#(\d+)/) ? message.match(/#(\d+)/)[1]: ''
    if(rgx) phone = rgx
    if(!phone) {
      await sendMessage({ pongMessage: 'Debe ingresar un #wpt',  conversationId, receptorIds})
      return
    }
    
    message = message.replace(`#${phone}`, '')
    if(!message) return

    wtp.sendMessage(`${phone}@c.us`, message).then(async ()=>{
      sendMessage({ pongMessage: 'Mensaje enviado a su destinatario',  conversationId, receptorIds })
    }).catch(async ()=>{
      sendMessage({ pongMessage: 'Error al enviar el mensaje',  conversationId, receptorIds})
    }).finally(async()=>{
      sendTyping({ conversationId, typing: false })
    })

    await sendTyping({ conversationId, typing: true })
  } catch (error) {
    console.log(error);
  }
}

const chatOpt = {
  state: 'initChat',
  options: {
    initChat: {
      sms: 'Bienvenido al servicio de registro de tickets <br /> ¿sobre cual proyecto desea registrar la incidencia? <br /> '
    },
    selectType: {
      sms: 'Seleccione un tipo de servicio para la incidencia',
    },
    selectService: {
      sms: 'Seleccione el servicio'
    },
    sendTitle: 'Ingrese un titulo para su ticket',
    sendDescription: 'Ingrese una descripcion para su ticket'
  }
}
const ticketService = async ({ message, conversationId, receptorIds })=>{
  try {
    const { state, options } = chatOpt
    let pongMessage = ''

    switch (state) {
      case 'initChat':
        let projects = await getSupProjects()
        pongMessage = `${options[state].sms}<br/> `

        projects.forEach((val, i)=>{
          pongMessage += `${i+1}. ${val.key} <br/>`
        })

        await sendMessage({ pongMessage, conversationId, receptorIds })

        chatOpt.state = 'selectType'
        options.selectType.projects = projects

        break;
      case 'selectType':
        let selectProject = options.selectType.projects[message[0]-1]
        let types = await getSubTypes(selectProject.key)
        pongMessage = `${options[state].sms}<br/> `

        types.forEach((val, i)=>{
          pongMessage += `${i+1}. ${val.key} <br/>`
        })

        await sendMessage({ pongMessage, conversationId, receptorIds })
        chatOpt.state = 'selectService'
        options.selectService.types = types

        break;
      case 'selectService':

        break
      default:
        break;
    }
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
      de lo contrario devuelve '' */
      
      let opt = !!message.match(/^\/\S*/) ? message.match(/^\/\S*/)[0] : ''
      if(!opt && initValMessages[conversationId]) opt = initValMessages[conversationId]
      
      if(message.indexOf(`${opt} `) !== -1){
        message = message.replace(`${opt} `, '')
      }

      switch (opt) {
        case '/chatGpt':
          chatGptService({ message, conversationId, receptorIds })
          break;
        
        case '/wtp':
          wtpService({ message, conversationId, receptorIds })
          break
        
        case '/ticket':
          ticketService({ message, conversationId, receptorIds })
          break

          default:
            break;
      }

      initValMessages[conversationId] = opt
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