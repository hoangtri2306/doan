const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize, checkStatus } = require('../middlewares/auth.middleware');
const { writeLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

// BUG-030: thêm checkStatus
router.post('/', authenticate, checkStatus, writeLimiter, reportController.createReport);

// Admin routes
router.get('/', authenticate, authorize(['ADMIN']), reportController.listReports);
router.put('/:id', authenticate, authorize(['ADMIN']), reportController.resolveReport);

module.exports = router;
