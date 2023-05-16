const { Router } = require('express')
const { getUser, sendMail, getDrafts, readMail, watch, endPoint, login, getHistory } = require('../controllers/gmail')

const router = Router()

router.get('/mail/user', getUser)
router.get('/mail/send', sendMail);
router.get('/mail/drafts',  getDrafts);
router.get('/mail/read/:messageId',  readMail);
router.get('/mail/watch', watch);
// router.get('/mail/listen', listenForMessages);
router.post('/mail/endPoint', endPoint);
router.post('/mail/login', login);
router.get('/mail/getHistory/:historyId', getHistory);

module.exports = router