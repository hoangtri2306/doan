const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, interactionController.interact);
router.post('/bookmark', authenticate, interactionController.bookmark);
router.delete('/bookmark/:postId', authenticate, interactionController.unbookmark);

module.exports = router;
