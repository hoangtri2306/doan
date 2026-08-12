const multer = require('multer');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // BUG-013: MulterError (file quá lớn, sai field...) → 4xx thay vì 500
  if (err instanceof multer.MulterError) {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File quá lớn. Giới hạn tối đa 100MB cho mỗi file.'
      : `Upload error: ${err.message}`;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // BUG-021: production không lộ chi tiết lỗi nội bộ (tránh information disclosure)
  const isProd = process.env.NODE_ENV === 'production';
  const finalMessage = isProd && statusCode >= 500 ? 'Internal Server Error' : message;

  res.status(statusCode).json({
    success: false,
    message: finalMessage,
    data: isProd ? null : err.stack
  });
};

module.exports = { errorMiddleware };
