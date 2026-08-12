const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: { origin: '*' }
    });

    // BUG-003: Xác thực JWT ở handshake — không tin client tự khai userId
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.data.userId = (decoded.userId || decoded.id).toString();
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_user_room', (userId) => {
        if (!userId) return;
        // Chỉ cho join phòng CỦA CHÍNH MÌNH
        if (socket.data.userId === userId.toString()) {
          socket.join(userId.toString());
          console.log(`User ${userId} joined room`);
        } else {
          console.warn(`Rejected join_user_room=${userId} by socket of user=${socket.data.userId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    return io;
  },
  
  getIO: () => {
    if (!io) {
      console.warn('Socket.io is not initialized yet!');
      return null;
    }
    return io;
  },

  sendNotification: (receiverId, notificationData) => {
    if (io) {
      io.to(receiverId.toString()).emit('new_notification', notificationData);
    }
  },

  sendToUser: (userId, event, data) => {
    if (io) {
      io.to(userId.toString()).emit(event, data);
    }
  }
};
