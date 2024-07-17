const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let scene = document.querySelector("a-scene");
let players = {};
function sendUpdate() {
  socket.emit("player update", { id: playerId, position: player.getAttribute("position")});
}
setInterval(sendUpdate, 60)
socket.on("player update", (stuff) =>{
  if(stuff.id != playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-sphere");
    newPlayer.setAttribute("color", "green")
    
    players[stuff.id] = newPlayer;
    scene.appendChild(newPlayer);
  } else if(stuff.id in players) {
    players[stuff.id].setAttribute("position", stuff.position);
  }
})
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

