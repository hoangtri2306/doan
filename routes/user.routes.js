const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, optionalAuthenticate, checkStatus } = require('../middlewares/auth.middleware');

// BUG-018: auth tập trung vào /api/auth/* (auth.routes.js).
// user.routes chỉ giữ các endpoint profile/user — không còn register/login/refresh trùng lặp.
router.post('/logout', authenticate, userController.logout);
router.put('/profile', authenticate, checkStatus, userController.updateProfile);
router.get('/me', authenticate, checkStatus, userController.getMe);
router.get('/me/bookmarks', authenticate, checkStatus, userController.getBookmarks);
router.get('/:username', optionalAuthenticate, userController.getPublicProfile);

module.exports = router;
