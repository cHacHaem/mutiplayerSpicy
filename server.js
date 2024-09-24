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
  tag: {},
  tag1: {  players: [], started: false, whoIt: "undecided", timeLeft: 30, timeToStart: 30, intervalStart: undefined },
  tag2: {  players: [], started: false, whoIt: "undecided", timeLeft: 30 },
  tag3: {  players: [], started: false, whoIt: "undecided", timeLeft: 30 },
};
let idToName = {};
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
app.post('/save-scene', (req, res) => {
  const sceneData = req.body.scene;
  
  // Save to the Glitch project (e.g., index.html or a specific A-Frame file)
  fs.writeFileSync(__dirname + '/public/tag/index.html', sceneData, 'utf8');
  res.send({ status: 'success' });
});
// Chatroom
io.on("connection", function (socket) {
  let world;
  let playerId;
  let playerName;
  //room sort and world connection
 socket.on("world", (data) => {
  playerId = data.id;
  playerName = data.name;
  idToName[playerId] = playerName;
  if (data.world == "hub") {
    world = "hub";
    socket.join(world);
  } else if (data.world == "tag") {
    function joinTag() {
       socket.join(world);
        socket.emit("world", world);  // Send the world info to the player
        socket.to(world).emit("chat message", {message: idToName[playerId]+" joined the game", id: "server", name: "server"})
        // Add the player to the players array
        game.tag[world].players.push(playerId);

        console.log(game.tag[world].players.length);
        io.to(world).emit("time to start", "waiting for players...",)
        // Handle game start logic based on the number of players
        if (game.tag[world].players.length > 4) {
          startTag();
          clearInterval(game.tag[world].intervalStart);
        } else if (game.tag[world].players.length > 1) {
          if (game.tag[world].intervalStart) clearInterval(game.tag[world].intervalStart);
          game.tag[world].timeToStart = 30;
          game.tag[world].intervalStart = setInterval(() => {
            if(game.tag[world]) {
              io.to(world).emit("time to start", game.tag[world].timeToStart);
            game.tag[world].timeToStart--;
            if (game.tag[world].timeToStart < 1 && game.tag[world].players.length > 1) {
              startTag();
              clearInterval(game.tag[world].intervalStart);
            }
            }
          }, 1000);
        }
    } 
    if(Object.keys(game.tag).length > 0) {
      let worldFound = false;
       // Look for the first available tag room that hasn't started yet
    Object.keys(game.tag).forEach((worldKey) => {
      if (!game.tag[worldKey].started && !worldFound) {
        worldFound = true;
        world = worldKey;
        joinTag();
      }
    }); 
    } else {
      console.log("making world")
      world = "tag-"+generateRandomString(5);
      game.tag[world] = {  players: [], started: false, whoIt: "undecided", timeLeft: 30, timeToStart: 30, intervalStart: undefined };
      joinTag()
    }

    // Fallback for if no world was found (optional)
  }
  console.log(game);
});

  //tag
  socket.on("player tagged", (data) => {
        console.log("player tagged: ", data);
        socket.to(world).emit("player tagged", data);
        game.tag[world].whoIt = data;
        io.to(world).emit("chat message", { message: idToName[data]+" was tagged!", id: "server", name: "server" })
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
      io.to(world).emit("time left", game.tag[world].timeLeft)
  if (game.tag[world].timeLeft < 1) {
    clearInterval(gameTimer);
    console.log("game ", world, " is over.");
    let winners = game.tag[world].players;
    removeString(winners, game.tag[world].whoIt)
    winners.forEach((winId)=>{
      winners.push(idToName[winId]);
      removeString(winners, winId);
    })
    io.to(world).emit("chat message", {message: winners +" won! And "+idToName[game.tag[world].whoIt]+" lost!"})
   delete game.tag[world]
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
    if(game.tag[world].players.length < 1) delete game.tag[world] 
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
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}