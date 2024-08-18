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
    let newPlayer = document.createElement("a-cylinder");
    let newPlayerSkin = document.createElement("a-entity");
     newPlayerSkin.setAttribute("move", "jkw")
    newPlayerSkin.setAttribute("gltf-model", "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/player_idle2.glb?v=1724004739221")
    newPlayerSkin.setAttribute("scale", "0.4 0.4 0.4")
    newPlayerSkin.setAttribute("position", "")
  newPlayer.setAttribute("static-body", "shape", "cylinder")
    newPlayer.appendChild(newPlayerSkin)
    players[stuff.id] = newPlayer;
    scene.appendChild(newPlayer);
  } else if(stuff.id in players) {
    stuff.position.y += 1
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

