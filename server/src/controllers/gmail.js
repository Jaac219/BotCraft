const axios = require("axios");
const { generateConfig } = require("../utils");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const {OAuth2Client} = require('google-auth-library');
const jwt = require('jsonwebtoken');

// const {PubSub} = require('@google-cloud/pubsub');

require("dotenv").config();
let globalTokens = {}

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const client = new OAuth2Client(process.env.CLIENT_ID);

oAuth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    globalTokens = tokens
    oAuth2Client.setCredentials(tokens);
  }
});

async function login(req, res){
  const { code, authuser, prompt, scope } = req.body
  const { tokens } = await oAuth2Client.getToken(code)
  globalTokens = tokens
  oAuth2Client.setCredentials(tokens)
}

async function watch(req, res) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })
    // const resp = await gmail.users.labels.list({
    //   userId: 'me'
    // })
    // const labels = resp.data.labels
    // if (!labels || labels.length === 0) {
    //   console.log('No labels found.')
    //   return
    // }

    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        // Replace with `projects/${PROJECT_ID}/topics/${TOPIC_NAME}`
        topicName: `projects/famous-robot-386420/topics/famous-robot-topic`,
        labelIds: ['INBOX', 'UNREAD'],
        labelFilterAction: 'include'
      }
    });
    console.log(response.data);

    // res.json(response.data)
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getHistory(req, res){
  try {
    // { emailAddress: 'dev16@codecraftdev.com', historyId: 83385 }
    // { emailAddress: 'dev16@codecraftdev.com', historyId: 83399 }
    // { emailAddress: 'jaac219@gmail.com', historyId: 5698852 }
    // { emailAddress: 'dev16@codecraftdev.com', historyId: 83471 }
    // { emailAddress: 'dev16@codecraftdev.com', historyId: 83485 }
    // { emailAddress: 'jaac219@gmail.com', historyId: 5698980 }

//     { emailAddress: 'jaac219@gmail.com', historyId: 5698997 }
// { emailAddress: 'jaac219@gmail.com', historyId: 5699005 }
// { emailAddress: 'jaac219@gmail.com', historyId: 5699014 }
// { emailAddress: 'jaac219@gmail.com', historyId: 5699059 }

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const rs = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: `${req.params.historyId}`
    })

    const { history } = rs.data

    let messageId = history[0].messages[0].id
    console.log(messageId, 'history ----->');

    const resMessage = await gmail.users.messages.get({
      userId: 'me',
      id: messageId
    })

    let message = Buffer.from(resMessage.data.payload.parts[0].body.data, 'base64').toString(
      'utf-8'
    );
    console.log(message, 'Message --->');
  } catch (error) {
    console.log(error);
  }
}

async function endPoint(req, res){
  try {
    if (globalTokens.refresh_token) {
      const { body: { message: { data, messageId, publishTime, attributes } }} = req
      // console.log(req.header('Authorization'), 'Message ------->');
      req.params.messageId = messageId

      // const bearer = req.header('Authorization');
      // const [, token] = bearer.match(/Bearer (.*)/);
    
      // const decodedToken = jwt.decode(token);

      // const ticket = await client.verifyIdToken({
      //   idToken: token,
      //   audience: decodedToken.aud,
      // });
      
      // const payload = ticket.getPayload();
      // const userid = payload['sub'];

      // The message is a unicode string encoded in base64.
      let message = Buffer.from(data, 'base64').toString(
        'utf-8'
      );

      message = JSON.parse(message)
      console.log(message);

      // const resMessage = await gmail.users.messages.get({
      //   userId: 'me',
      //   id: history.history[0].messages[0].id
      // })
      // JSON.stringify(res.data, null, 4)
    }
    res.status(200).send()
  } catch (error) {
    console.log(error);
    res.status(400)
  }
  // let ms = await readMail(req, res)
  // console.log('New Message', ms);
}

// async function authenticateImplicitWithAdc() {
//   // This snippet demonstrates how to list buckets.
//   // NOTE: Replace the client created below with the client required for your application.
//   // Note that the credentials are not specified when constructing the client.
//   // The client library finds your credentials using ADC.
//   const storage = new Storage({
//     projectId: 'famous-robot-386420',
//   });
//   const [buckets] = await storage.getBuckets();
//   console.log('Buckets:');

//   for (const bucket of buckets) {
//     console.log(`- ${bucket.name}`);
//   }

//   console.log('Listed all storage buckets.');
// }
// authenticateImplicitWithAdc();


// async function listenForMessages(req, res) {
//   // References an existing subscription
//   await test(req, res)

//   const pubSubClient = new PubSub({
//     projectId: 'famous-robot-386420'
//   });
//   const subscription = pubSubClient.subscription('test')

//   // Create an event handler to handle messages
//   let messageCount = 0
//   const messageHandler = (message) => {
//     // console.log(`Received message ${message.id}:`)
//     // console.log(`\tData: ${message.data}`)
//     console.log(`\tData: ${message}`)
//     console.log(`\tData2: ${message.data}`)

//     messageCount += 1
    
//     // req.params.messageId = message.id
//     // readMail(req, res)
//     // "Ack" (acknowledge receipt of) the message
//     message.ack()
//   }

//   // Listen for new messages until timeout is hit
//   subscription.on('message', messageHandler)

//   // Wait a while for the subscription to run. (Part of the sample only.)
//   // setTimeout(() => {
//   //   subscription.removeListener('message', messageHandler)
//   //   console.log(`${messageCount} message(s) received.`)
//   // }, 10 * 1000)
// }

async function sendMail(req, res) {
  try {
    console.log('global tokens', globalTokens);
    const accessToken = await oAuth2Client.getAccessToken();

    const auth = {
      type: "OAuth2",
      user: "dev16@codecraftdev.com",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: globalTokens.refresh_token,
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { ...auth, accessToken }
    })

    const mailOptions = {
      from: "Jaac <jaac219@gmail.com>",
      to: "dev16@codecraftdev.com",
      subject: "Gmail API NodeJS",
      text: "Pong ...",
    };

    const result = await transport.sendMail(mailOptions);
    console.log(result);

  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getUser(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/profile`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getDrafts(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/drafts`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function readMail(req, res) {
  try {
    // const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${req.params.messageId}`;
    // const { token } = await oAuth2Client.getAccessToken();
    // const config = generateConfig(url, token);
    // const response = await axios(config);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.messageId,
      format: 'full' // Esto es importante para obtener el cuerpo del mensaje
    });

    console.log('ready read email', response)

    // return data
    res.json(response);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

module.exports = {
  getUser,
  sendMail,
  getDrafts,
  readMail,
  // listenForMessages,
  watch,
  endPoint,
  login,
  getHistory
};