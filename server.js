// Setup basic express server
var express = require("express");
var fs = require("fs");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
let chat = {};
let game = {
  hub: { players: [] },
  tag1: {  players: [], started: false, whoIt: "undecided", timeLeft: 30 },
  tag2: {  players: [], started: false, whoIt: "undecided", timeLeft: 30 },
  tag3: {  players: [], started: false, whoIt: "undecided", timeLeft: 30 },
};
try {
  const data = fs.readFileSync("chat.json");
  chat = JSON.parse(data) || {};
} catch (error) {
  console.log("No existing votes found, starting fresh.");
}
server.listen(port, function () {
  console.log("Server listening at port %d", port);
});

// Routing
app.use(express.static("public"));

// Chatroom
io.on("connection", function (socket) {
  let world;
  let playerId;
  //room sort and world connection
  socket.on("world", (data) => {
    playerId = data.id;
    if (data.world == "hub") {
      world = "hub";
      socket.join(world);
    } else if (data.world == "tag") {
      if (!game.tag1.started) {
        world = "tag1";
        socket.join(world)
        socket.emit("world", world);
        game.tag1.players.push(playerId)
        console.log(game.tag1.players.length)
        if(game.tag1.players.length > 1) {
          startTag()
        }
      } else if (!game.tag2.started) {
        world = "tag2";
        socket.join(world);
        socket.emit("world", world)
        game.tag2.players.push(playerId)
        if(game.tag2.players.length > 1) {
          startTag()
        }
      } else if (!game.tag3.started) {
        world = "tag3";
        socket.join(world);
        socket.emit("world", world)
        game.tag3.players.push(playerId)
        if(game.tag3.players.length > 1) {
          startTag()
        }
      }
    }
    console.log(game)
  });
  //tag
  socket.on("player tagged", (data) => {
        console.log("player tagged: ", data);
        socket.to(world).emit("player tagged", data);
      });
  function startTag() {
    game[world].started = true;
    game[world].timeLeft = 30;
    let players = game[world].players;
  const randomIndex = Math.floor(Math.random() * players.length);
    game[world].whoIt = players[randomIndex];
    io.to(world).emit("game start", players[randomIndex]);
    let gameTimer = setInterval(() => {
  game[world].timeLeft--
      io.to(world).emit("time left", game[world].timeLeft)
  if (game[world].timeLeft < 1) {
    clearInterval(gameTimer);
    console.log("game ", world, " is over.");
    let winners = game[world].players;
    removeString(winners, game[world].whoIt)
    io.to(world).emit("game over", {winners: winners, loser: game[world].whoIt})
  }
}, 1000);
  }
  //general
  socket.on("chat message", function (data) {
    console.log(data);
    chat[data.time] = { message: data.message, id: data.id, name: data.name };
    // fs.writeFileSync('chat.json', JSON.stringify(chat, null, 2));
    // const data2 = fs.readFileSync('chat.json');
    //chat = JSON.parse(data2) || {};
    //console.log(chat)
    socket.to(world).emit("chat message", data);
  }); 
  socket.on("player update", function (data) {
    // we tell the client to execute 'new message'
    socket.to(world).emit("player update", data);
  });

  socket.on("disconnect", function (data) {
    socket.to(world).emit("player left", playerId);
    removeString(game[world].players, playerId)
    game[world].started = false
    game[world].whoIt = "undecided"
    console.log(game)
  });
});
function removeString(ary, str) {
  let index;
  if(ary) index = ary.indexOf(str); // Find the index of the string
  if (index !== -1) { // Check if the string exists in the array
    ary.splice(index, 1); // Remove the string at the found index
  }
}