const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  searchUsers,
  getUserById
} = require('../controllers/userControllers');

// Public routes - must come first
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/search', protect, searchUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUser);
router.get('/', protect, getAllUsers);

// Protected routes with parameters - must come last
router.get('/:id', protect, getUserById);

module.exports = router;