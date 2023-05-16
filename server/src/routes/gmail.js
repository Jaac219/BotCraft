const { Router } = require('express')
const { getUser, sendMail, getDrafts, readMail, watch, endPoint, login, getHistory } = require('../controllers/gmail')

const router = Router()

router.get('/user', getUser)
router.get('/send', sendMail);
router.get('/drafts',  getDrafts);
router.get('/read/:messageId',  readMail);
router.get('/watch', watch);
// router.get('/listen', listenForMessages);
router.post('/endPoint', endPoint);
router.post('/login', login);
router.get('/getHistory/:historyId', getHistory);

module.exports = router