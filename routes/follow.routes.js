const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, followController.toggleFollow);

module.exports = router;
