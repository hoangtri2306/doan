const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticate, optionalAuthenticate, checkStatus } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { writeLimiter, aiLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.get('/', optionalAuthenticate, postController.listPosts);
router.get('/me/posts', authenticate, checkStatus, postController.getMyPosts);
router.get('/me/bookmarks', authenticate, checkStatus, postController.getBookmarkedPosts);
router.get('/:id/content', authenticate, postController.getPostContent); // lấy nội dung kể cả khi HIDDEN
router.get('/:id', optionalAuthenticate, postController.getPost);
router.get('/slug/:slug', optionalAuthenticate, postController.getPostBySlug);

router.post('/', authenticate, checkStatus, aiLimiter, writeLimiter, upload.array('media', 10), postController.createPost);
router.post('/:id/repost', authenticate, checkStatus, writeLimiter, postController.repost);
router.put('/:id', authenticate, checkStatus, writeLimiter, postController.updatePost);
router.delete('/:id', authenticate, checkStatus, writeLimiter, postController.deletePost);

module.exports = router;
