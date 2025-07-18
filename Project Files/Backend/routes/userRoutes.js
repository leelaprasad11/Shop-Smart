const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Test route
router.get('/', (req, res) => {
  res.send('User route works');
});

// Register
router.post('/register', userController.register);
// Login
router.post('/login', userController.login);
// Get profile (protected)
router.get('/profile', auth, userController.getProfile);

module.exports = router; 