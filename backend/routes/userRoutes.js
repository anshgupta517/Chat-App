
import express from 'express';
const { registerUser } = require('../controllers/userControllers');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;