// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, forgotPassword, resetPassword, changePassword, verifyEmail, verifyEmailCode, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/verify-email/:token', verifyEmail);
router.post('/verify-email-code', verifyEmailCode);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update', protect, upload.single('avatar'), updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
