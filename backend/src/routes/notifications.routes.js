const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, clearNotifications } = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/clear', clearNotifications);

module.exports = router;
