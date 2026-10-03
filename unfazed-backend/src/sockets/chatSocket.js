module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', (data) => {
      socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });
};
