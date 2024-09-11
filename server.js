// Setup basic express server
var express = require("express");
var fs = require("fs")
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
let chat = {};
try {
  const data = fs.readFileSync('chat.json');
  chat = JSON.parse(data) || {};
} catch (error) {
  console.log('No existing votes found, starting fresh.');
}
server.listen(port, function () {
  console.log("Server listening at port %d", port);
});

// Routing
app.use(express.static("public"));

// Chatroom
io.on("connection", function (socket) {
  socket.on("chat message", function (data) {
    console.log(data)
    chat[data.time] = {message: data.message, id: data.id, name: data.name}
   // fs.writeFileSync('chat.json', JSON.stringify(chat, null, 2));
   // const data2 = fs.readFileSync('chat.json');
  //chat = JSON.parse(data2) || {};
    //console.log(chat)
    socket.broadcast.emit("chat message", data)
  })
  socket.on("player update", function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit("player update", data);
  });

  socket.on("player left", function (data) {
    console.log("player left ", data)
    socket.broadcast.emit("player left", data)
  });
});
