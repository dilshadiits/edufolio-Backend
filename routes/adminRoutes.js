const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    login,
    register,
    getMe,
    verifyToken,
    updatePassword,
    getStats
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.get('/stats', protect, getStats);
router.put('/password', protect, updatePassword);

module.exports = router;