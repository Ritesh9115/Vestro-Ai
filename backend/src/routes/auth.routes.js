const express = require('express');
const { signup, login, logout, refreshToken, forgotPassword, resetPassword, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, resetPassword);
router.get('/me', authenticate, getMe);

module.exports = router;
