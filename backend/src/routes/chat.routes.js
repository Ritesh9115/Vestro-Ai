const express = require('express');
const { sendMessage, getChatHistory, clearChat } = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { chatMessageValidator } = require('../middleware/validate.middleware');
const router = express.Router();

router.use(authenticate);
router.post('/', chatMessageValidator, sendMessage);
router.get('/:symbol', getChatHistory);
router.delete('/:symbol', clearChat);

module.exports = router;
