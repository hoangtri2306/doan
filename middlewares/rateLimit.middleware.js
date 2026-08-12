/**
 * Rate limiting — BUG-011
 * Chống brute-force auth, spam tạo nội dung, và lạm dụng AI service.
 * Mỗi nhóm route dùng instance RIÊNG (không dùng chung store) để tránh block oan.
 */
const rateLimit = require('express-rate-limit');

const message = { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' };

const createLimiter = (windowMs, max) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message
});

// Auth: 20 lần / 15 phút (login/register/refresh)
const authLimiter = createLimiter(15 * 60 * 1000, 20);

// Tạo nội dung (post/comment/report/appeal/moderation log): 30 lần / phút
const writeLimiter = createLimiter(60 * 1000, 30);

// Like / bookmark / follow: 60 lần / phút (nhẹ nhàng hơn, user hay bấm liên tục)
const interactionLimiter = createLimiter(60 * 1000, 60);

// Tin nhắn / hội thoại: 60 lần / phút
const messageLimiter = createLimiter(60 * 1000, 60);

// Gọi AI analyze (qua route tạo post/comment): 20 lần / phút
const aiLimiter = createLimiter(60 * 1000, 20);

module.exports = { authLimiter, writeLimiter, interactionLimiter, messageLimiter, aiLimiter };
