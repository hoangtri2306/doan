const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, optionalAuthenticate, checkStatus } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.post('/register', authLimiter, userController.register);
router.post('/login', authLimiter, userController.login);
router.post('/refresh', authLimiter, userController.refreshToken);
router.post('/logout', authenticate, userController.logout);
router.put('/profile', authenticate, checkStatus, userController.updateProfile);
router.get('/me', authenticate, checkStatus, userController.getMe);
router.get('/me/bookmarks', authenticate, checkStatus, userController.getBookmarks);
router.get('/:username', optionalAuthenticate, userController.getPublicProfile);

module.exports = router;
