//good origonal 
var express = require("express");
var fs = require("fs");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;
let chat = {};
let game = {
  hub: { players: [] },
  tag: {"hi": {  players: [], started: false, whoIt: "undecided", timeLeft: 30, timeToStart: 30, intervalStart: undefined }, "bye": {  players: [], started: false, whoIt: "undecided", timeLeft: 30, timeToStart: 30, intervalStart: undefined }},
  tag1: {  players: [], started: false, whoIt: "undecided", timeLeft: 30, timeToStart: 30, intervalStart: undefined },
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
    let worldFound = false;

    // Look for the first available tag room that hasn't started yet
    Object.keys(game.tag).forEach((worldKey) => {
      if (!game.tag[worldKey].started && !worldFound) {
        worldFound = true;
        world = worldKey;

        // Make the player join the room
        socket.join(world);
        socket.emit("world", world);  // Send the world info to the player

        // Add the player to the players array
        game.tag[worldKey].players.push(playerId);

        console.log(game.tag[worldKey].players.length);

        // Handle game start logic based on the number of players
        if (game.tag[worldKey].players.length > 5) {
          startTag();
        } else if (game.tag[worldKey].players.length > 1) {
          if (game.tag[world].intervalStart) clearInterval(game.tag[world].intervalStart);
          game.tag[world].timeToStart = 30;
          game.tag[world].intervalStart = setInterval(() => {
            io.to(world).emit("time to start", game.tag[world].timeToStart);
            game.tag[world].timeToStart--;
            if (game.tag[world].timeToStart < 1 && game.tag[worldKey].players.length > 1) {
              startTag();
              clearInterval(game.tag[world].intervalStart);
            }
          }, 1000);
        }
      }
    });

    // Fallback for if no world was found (optional)
    if (!worldFound) {
      console.log("No available tag rooms.");
    }
  }
  console.log(game);
});

  //tag
  socket.on("player tagged", (data) => {
        console.log("player tagged: ", data);
        socket.to(world).emit("player tagged", data);
      });
  function startTag() {
    game.tag[world].started = true;
    game.tag[world].timeLeft = 60;
    let players = game.tag[world].players;
  const randomIndex = Math.floor(Math.random() * players.length);
    game.tag[world].whoIt = players[randomIndex];
    io.to(world).emit("game start", players[randomIndex]);
    let gameTimer = setInterval(() => {
  game.tag[world].timeLeft--
      io.to(world).emit("time left", game[world].timeLeft)
  if (game[world].timeLeft < 1) {
    clearInterval(gameTimer);
    console.log("game ", world, " is over.");
    let winners = game[world].players;
    removeString(winners, game.tag[world].whoIt)
    io.to(world).emit("game over", {winners: winners, loser: game.tag[world].whoIt})
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

  // Check if 'game[world]' exists before accessing 'players'
  if (game[world]) {
    removeString(game[world].players, playerId);
    game[world].started = false;
    game[world].whoIt = "undecided";
  } else if(game.tag[world]) {
    removeString(game.tag[world].players, playerId);
    game.tag[world].started = false;
    game.tag[world].whoIt = "undecided";
  } else {
    console.log(`Game world ${world} not defined.`);
  }

  console.log(game); 
});

});
function removeString(ary, str) {
  let index;
  if(ary) index = ary.indexOf(str); // Find the index of the string
  if (index !== -1) { // Check if the string exists in the array
    ary.splice(index, 1); // Remove the string at the found index
  }
}