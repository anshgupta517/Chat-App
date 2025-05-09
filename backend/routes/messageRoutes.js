const express = require('express');
const router = express.Router();

// Placeholder route for messages
router.get('/', (req, res) => {
    res.json({ message: 'Message routes working' });
});

module.exports = router;
