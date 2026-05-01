const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh', userController.refreshToken);
router.post('/logout', authenticate, userController.logout);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/me', authenticate, userController.getMe);
router.get('/me/bookmarks', authenticate, userController.getBookmarks);

module.exports = router;
