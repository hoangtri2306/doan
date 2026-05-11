const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', optionalAuthenticate, postController.listPosts);
router.get('/:id', optionalAuthenticate, postController.getPost);
router.get('/slug/:slug', optionalAuthenticate, postController.getPostBySlug);
router.get('/me/posts', authenticate, postController.getMyPosts);
router.get('/me/bookmarks', authenticate, postController.getBookmarkedPosts);

router.post('/', authenticate, upload.array('media', 10), postController.createPost);
router.post('/:id/repost', authenticate, postController.repost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router;
