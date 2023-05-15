require("dotenv").config();

const auth = {
  type: "OAuth2",
  user: "dev16@codecraftdev.com",
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
};

const mailoptions = {
  from: "Dev16 <dev16@codecraftdev.com>",
  to: "jaac219@gmail.com",
  subject: "Gmail API NodeJS",
};

module.exports = {
  auth,
  mailoptions,
};