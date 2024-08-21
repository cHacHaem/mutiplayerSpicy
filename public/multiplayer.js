const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let scene = document.querySelector("a-scene");
let players = {};
let smoothness = 0.1; // Adjust this value to control how smooth the movement is

function sendUpdate() {
  socket.emit("player update", { id: playerId, position: player.getAttribute("position") });
}
setInterval(sendUpdate, 60);

socket.on("player update", (stuff) => {
  if (stuff.id !== playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-entity");
    let newPlayerHitbox = document.createElement("a-cylinder");

    newPlayer.setAttribute("gltf-model", "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/player_idle2.glb?v=1724004739221");
    newPlayer.setAttribute("scale", "0.4 0.4 0.4");
    newPlayer.setAttribute("visible", "true");
    newPlayer.setAttribute("move", "hfk")
    newPlayer.setAttribute("rotation", "0 -90 0")
    newPlayerHitbox.setAttribute("static-body", "shape", "cylinder");
    newPlayerHitbox.setAttribute("visible", "false");
    newPlayerHitbox.setAttribute("position", "0 5.25 0");
    newPlayerHitbox.setAttribute("height", "4");

    newPlayer.appendChild(newPlayerHitbox);
    players[stuff.id] = { entity: newPlayer, targetPosition: stuff.position };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    players[stuff.id].targetPosition = stuff.position;
  }
});

function animatePlayers() {
  Object.keys(players).forEach((id) => {
    let player = players[id];
    let currentPosition = player.entity.getAttribute("position");

    currentPosition.x += (player.targetPosition.x - currentPosition.x) * smoothness;
    currentPosition.y += (player.targetPosition.y - currentPosition.y) * smoothness;
    currentPosition.z += (player.targetPosition.z - currentPosition.z) * smoothness;

    player.entity.setAttribute("position", currentPosition);
  });
  requestAnimationFrame(animatePlayers);
}

animatePlayers();

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
