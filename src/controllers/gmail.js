const axios = require("axios");
const { generateConfig } = require("../utils");
const CONSTANTS = require("../constants");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');

require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function test(req, res) {
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
        labelIds: ['INBOX'],
        labelFilterAction: 'INCLUDE'
      }
    });
    console.log(response.data);

    // res.json(response.data)
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

function endPoint(req, res){
  console.log('yessss', req)
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


async function listenForMessages(req, res) {
  // References an existing subscription
  await test(req, res)

  const pubSubClient = new PubSub({
    projectId: 'famous-robot-386420'
  });
  const subscription = pubSubClient.subscription('test')

  // Create an event handler to handle messages
  let messageCount = 0
  const messageHandler = (message) => {
    // console.log(`Received message ${message.id}:`)
    // console.log(`\tData: ${message.data}`)
    console.log(`\tData: ${message}`)
    console.log(`\tData2: ${message.data}`)

    messageCount += 1
    
    // req.params.messageId = message.id
    // readMail(req, res)
    // "Ack" (acknowledge receipt of) the message
    message.ack()
  }

  // Listen for new messages until timeout is hit
  subscription.on('message', messageHandler)

  // Wait a while for the subscription to run. (Part of the sample only.)
  // setTimeout(() => {
  //   subscription.removeListener('message', messageHandler)
  //   console.log(`${messageCount} message(s) received.`)
  // }, 10 * 1000)
}

async function sendMail(req, res) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        ...CONSTANTS.auth,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      ...CONSTANTS.mailoptions,
      text: "The Gmail API with NodeJS works",
    };

    const result = await transport.sendMail(mailOptions);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getUser(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/profile`;
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
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/drafts`;
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
    console.log('req ------>', req.params.messageId);
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${req.params.messageId}`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = generateConfig(url, token);
    const response = await axios(config);

    let data = await response.data;

    console.log(data);
    res.json(data);
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
  listenForMessages, 
  test,
  endPoint
};