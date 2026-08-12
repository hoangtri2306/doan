const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate, checkStatus } = require('../middlewares/auth.middleware');

// BUG-030: thêm checkStatus để chặn user BANNED
router.get('/', authenticate, checkStatus, notificationController.getNotifications);
router.patch('/read-all', authenticate, checkStatus, notificationController.markAllAsRead);
router.patch('/:id/read', authenticate, checkStatus, notificationController.markAsRead);
router.put('/:id/read', authenticate, checkStatus, notificationController.markAsRead); // keep for backward compatibility
router.delete('/:id', authenticate, checkStatus, notificationController.delete);

module.exports = router;
