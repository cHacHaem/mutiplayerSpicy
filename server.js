const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for position updates from clients
  socket.on('message', (data) => {
    // Broadcast the position update to all other clients
    console.log(data)
    socket.broadcast.emit('playerMoved', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
