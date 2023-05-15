const { Router } = require('express')
const { getUser, sendMail, getDrafts, readMail, listenForMessages, test, endPoint } = require('../controllers/gmail')

const router = Router()

router.get('/mail/user/:email', getUser)
router.get('/mail/send', sendMail);
router.get('/mail/drafts/:email',  getDrafts);
router.get('/mail/read/:messageId',  readMail);
router.get('/mail/test', test);
router.get('/mail/listen', listenForMessages);
router.get('/mail/endPoint', endPoint);

module.exports = router