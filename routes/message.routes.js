const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate, checkStatus } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { messageLimiter } = require('../middlewares/rateLimit.middleware'); // BUG-011

router.use(authenticate);
router.use(checkStatus);

router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageLimiter, messageController.getOrCreateConversation);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:conversationId', messageController.getMessages);
router.delete('/:conversationId', messageLimiter, messageController.deleteConversation);
router.post('/send', messageLimiter, upload.array('media', 10), messageController.sendMessage);
router.post('/:messageId/react', messageLimiter, messageController.reactToMessage);

module.exports = router;

