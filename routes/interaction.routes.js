const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const { authenticate, checkStatus } = require('../middlewares/auth.middleware');
const { interactionLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.post('/', authenticate, checkStatus, interactionLimiter, interactionController.interact);
router.post('/bookmark', authenticate, checkStatus, interactionLimiter, interactionController.bookmark);
router.delete('/bookmark/:postId', authenticate, checkStatus, interactionLimiter, interactionController.unbookmark);

module.exports = router;
