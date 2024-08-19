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
    let newPlayerHitbox = document.createElement("a-cylinder");
    let newPlayer = document.createElement("a-entity");
     newPlayer.setAttribute("move", "jkw")
    newPlayer.setAttribute("gltf-model", "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/player_idle2.glb?v=1724004739221")
    newPlayer.setAttribute("scale", "0.4 0.4 0.4")
    newPlayer.setAttribute("position", "0 -2 0")
    newPlayer.setAttribute("visible", "false")
    newPlayer.setAttribute("visible", "true")
  newPlayer.setAttribute("static-body", "shape", "cylinder")
    newPlayerHitbox.setAttribute("height", "4")
    newPlayer.appendChild(newPlayerSkin)
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

