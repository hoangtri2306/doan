require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { errorMiddleware } = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

// BUG-011: khai báo trust proxy khi deploy sau reverse proxy (nginx/render/vercel...)
// Mặc định false ở local; set TRUST_PROXY=1 (hoặc số hop) trong .env production.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

// Middlewares
// BUG-020: security headers (tắt CSP để không vỡ inline styles của frontend hiện tại)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
// BUG-012: cần cookie-parser để đọc httpOnly refreshToken cookie
app.use(cookieParser());
// BUG-019: nâng giới hạn JSON body (post dài có content_html lớn qua update)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorMiddleware);

// Database connection & Server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-platform';

const http = require('http');
const server = http.createServer(app);
const socketService = require('./services/socket.service');
socketService.init(server);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

module.exports = app;
