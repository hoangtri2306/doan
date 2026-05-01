const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/post/:postId', commentController.getComments);
router.post('/', authenticate, commentController.createComment);

module.exports = router;
