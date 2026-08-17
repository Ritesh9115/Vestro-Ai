const express = require('express');
const { getProfile, updateProfile, getDashboard } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/dashboard', getDashboard);

module.exports = router;
