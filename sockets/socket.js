const { Server } = require('socket.io');

// Biến lưu trữ người dùng đang online
const onlineUsers = new Map();

/**
 * Khởi tạo socket.io
 * @param {http.Server} server - server đã tạo từ http
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    }
  });
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Lưu user online (khi người dùng kết nối)
    socket.on('addUser', (userId) => {
      const id = userId.toString();
      if (id) {
        if (!onlineUsers.has(id)) {
          onlineUsers.set(id, new Set());
        }
        onlineUsers.get(id).add(socket.id);
        console.log('✅ User connected:', onlineUsers);
      }
    });

    socket.on('cvSubmitted', (data) => {
      const { recruiterId, message } = data;
      if (onlineUsers.has(recruiterId)) {
        onlineUsers.get(recruiterId).forEach((socketId) => {
          io.to(socketId).emit('newCV', message);
        });
        console.log(`📤 Notification sent to recruiter: ${recruiterId}`);
      } else {
        console.warn(`⚠️ Recruiter with ID ${recruiterId} is not online`);
      }
    });
    socket.on('cvResponse', (data) => {
      const { applicantId, message } = data;
      if (onlineUsers.has(applicantId)) {
        onlineUsers.get(applicantId).forEach((socketId) => {
          io.to(socketId).emit('cvResponseNotification', message);
        });
        console.log(`📤 Notification sent to applicant: ${applicantId}`);
      } else {
        console.warn(`⚠️ Applicant with ID ${applicantId} is not online`);
      }
    });

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`✅ User joined room: ${conversationId}`);
    });

    // Khi người dùng ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      onlineUsers.forEach((sockets, userId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
          }
        }
      });
      console.log('User online:', onlineUsers);
    });
  });
  io.onlineUsers = onlineUsers;
  return io;
}

module.exports = { initSocket };
