const express = require('express');
const router = express.Router();
const appealController = require('../controllers/appeal.controller');
const { authenticate, authorize, checkStatus } = require('../middlewares/auth.middleware');
const { writeLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

// User routes (cần đăng nhập) — BUG-030: thêm checkStatus
router.post('/', authenticate, checkStatus, writeLimiter, appealController.createAppeal);
router.get('/my', authenticate, checkStatus, appealController.getMyAppeals);

// Admin routes
router.get('/pending', authenticate, authorize('ADMIN'), appealController.getPendingAppeals);
router.get('/all', authenticate, authorize('ADMIN'), appealController.getAllAppeals);
router.put('/:id/approve', authenticate, authorize('ADMIN'), appealController.approveAppeal);
router.put('/:id/reject', authenticate, authorize('ADMIN'), appealController.rejectAppeal);

module.exports = router;
