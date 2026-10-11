const ChatMessage = require('../models/ChatMessage');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);

    // Join room for specific therapist-client conversation
    socket.on('join_room', async (roomId) => {
      socket.join(roomId);
      console.log(`[Socket.io] User ${socket.id} joined conversation room: ${roomId}`);
    });

    // Handle incoming chat message
    socket.on('send_message', async (data) => {
      try {
        const { therapist_id, client_id, sender, message, room } = data;

        // Persist message to database
        const savedMessage = new ChatMessage({
          therapist_id,
          client_id,
          sender,
          message,
          read: false
        });
        await savedMessage.save();

        // Broadcast to all clients in this conversation room
        io.to(room).emit('receive_message', {
          _id: savedMessage._id,
          therapist_id,
          client_id,
          sender,
          message,
          read: false,
          createdAt: savedMessage.createdAt,
          room
        });
      } catch (err) {
        console.error('[Socket.io] Error persisting message:', err);
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.room).emit('user_typing', { sender: data.sender, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.room).emit('user_typing', { sender: data.sender, isTyping: false });
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { therapist_id, client_id, reader } = data;
        // If reader is therapist, mark client messages as read; and vice versa
        const targetSender = reader === 'therapist' ? 'client' : 'therapist';
        await ChatMessage.updateMany(
          { therapist_id, client_id, sender: targetSender, read: false },
          { $set: { read: true } }
        );
        socket.to(data.room).emit('messages_read', { reader });
      } catch (err) {
        console.error('[Socket.io] Error marking messages read:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Client disconnected:', socket.id);
    });
  });
};
