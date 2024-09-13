// Setup basic express server
var express = require("express");
var fs = require("fs")
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
let chat = {};
let game = {hub: [], tag1: [], tag2: []}
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
  let world;
  let whoIt;
  let playerId;
  socket.on("world", (data)=>{
    if(data.world == "hub") {
     world = "hub"
      playerId = data.id;
      socket.join(world)
    } else if(data.world == "tag") {
      world = "tag1"
      playerId = data.id
      socket.join(world)
      socket.on("player tagged", (data)=>{
        console.log("player tagged: ", data)
        socket.to(world).emit("player tagged", data)
        whoIt = data
      })
    }
      
  })
  socket.on("chat message", function (data) {
    console.log(data)
    chat[data.time] = {message: data.message, id: data.id, name: data.name}
   // fs.writeFileSync('chat.json', JSON.stringify(chat, null, 2));
   // const data2 = fs.readFileSync('chat.json');
  //chat = JSON.parse(data2) || {};
    //console.log(chat)
    socket.to(world).emit("chat message", data)
  })
  socket.on("player update", function (data) {
    // we tell the client to execute 'new message'
    socket.to(world).emit("player update", data);
  });

  socket.on("disconnect", function (data) {
    socket.to(world).emit("player left", playerId);
  });
});
