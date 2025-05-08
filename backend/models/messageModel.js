
import express from 'express';
const { allMessages, sendMessage } = require('../controllers/messageControllers');
const router = express.Router();

router.get('/:chatId', allMessages);
router.post('/', sendMessage);

module.exports = router;