const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { allMessages, sendMessage } = require('../controllers/messageControllers');

// Placeholder route for messages
router.get('/', (req, res) => {
    res.json({ message: 'Message routes working' });
});

router.get('/:chatId', protect, allMessages);
router.post('/', protect, sendMessage);

module.exports = router;
