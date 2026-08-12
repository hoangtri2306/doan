const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const { authenticate, checkStatus } = require('../middlewares/auth.middleware');
const { writeLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.post('/', authenticate, checkStatus, writeLimiter, interactionController.interact);
router.post('/bookmark', authenticate, checkStatus, writeLimiter, interactionController.bookmark);
router.delete('/bookmark/:postId', authenticate, checkStatus, writeLimiter, interactionController.unbookmark);

module.exports = router;
