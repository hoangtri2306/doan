/**
 * Rate limiting — BUG-011
 * Chống brute-force auth, spam tạo nội dung, và lạm dụng AI service.
 */
const rateLimit = require('express-rate-limit');

const message = { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' };

// Auth: 20 lần / 15 phút (login/register/refresh)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message
});

// Tạo nội dung / thao tác ghi: 30 lần / phút
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message
});

// Gọi AI analyze (qua route tạo post/comment): 20 lần / phút
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message
});

module.exports = { authLimiter, writeLimiter, aiLimiter };
