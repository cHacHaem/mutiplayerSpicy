// Setup basic express server
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("Server listening at port %d", port);
});

// Routing
app.use(express.static("public"));

// Chatroom
io.on("connection", function (socket) {
  socket.on("player update", function (data) {
    console.log(data);
    // we tell the client to execute 'new message'
    socket.broadcast.emit("player update", data);
  });

  socket.on("disconnect", function () {
    // echo globally that this client has left
  });
});
