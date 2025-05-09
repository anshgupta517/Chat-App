const express = require('express');
const router = express.Router();

// Placeholder route for users
router.get('/', (req, res) => {
    res.json({ message: 'User routes working' });
});

module.exports = router;