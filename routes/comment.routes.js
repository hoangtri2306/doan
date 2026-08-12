const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate, checkStatus } = require('../middlewares/auth.middleware');
const { aiLimiter, writeLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.get('/post/:postId', commentController.getComments);
router.get('/:id', authenticate, commentController.getCommentById);
router.post('/', authenticate, checkStatus, aiLimiter, writeLimiter, commentController.createComment);

module.exports = router;
