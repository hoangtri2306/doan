const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderation.controller');
const { authenticate, authorize, checkStatus } = require('../middlewares/auth.middleware');
const { writeLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

// BUG-030: thêm checkStatus
router.post('/report', authenticate, checkStatus, writeLimiter, moderationController.reportContent);
router.post('/log', authenticate, checkStatus, authorize(['MODERATOR', 'ADMIN']), writeLimiter, moderationController.logAction);

router.get('/queue', authenticate, authorize(['MODERATOR', 'ADMIN']), moderationController.getQueue);
router.put('/approve/:id', authenticate, authorize(['MODERATOR', 'ADMIN']), moderationController.approveItem);
router.put('/hide/:id', authenticate, authorize(['MODERATOR', 'ADMIN']), moderationController.hideItem);
router.put('/warn/:id', authenticate, authorize(['MODERATOR', 'ADMIN']), moderationController.warnItem);

module.exports = router;
