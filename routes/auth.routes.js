const express = require('express');
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011
const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);

module.exports = router;
