require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' }
});
require('./src/sockets/chatSocket')(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
