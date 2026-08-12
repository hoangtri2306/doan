const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate, checkStatus } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { writeLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.use(authenticate);
router.use(checkStatus);

router.get('/conversations', messageController.getConversations);
router.post('/conversations', writeLimiter, messageController.getOrCreateConversation);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:conversationId', messageController.getMessages);
router.delete('/:conversationId', writeLimiter, messageController.deleteConversation);
router.post('/send', writeLimiter, upload.array('media', 10), messageController.sendMessage);
router.post('/:messageId/react', writeLimiter, messageController.reactToMessage);

module.exports = router;

