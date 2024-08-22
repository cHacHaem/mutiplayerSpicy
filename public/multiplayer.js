const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let players = {};
let smoothness = 0.1; // Adjust this value to control how smooth the movement is

function sendUpdate() {
  const position = player.getAttribute("position");
  const rotation = cam.getAttribute("rotation");
  
  socket.emit("player update", { 
    id: playerId, 
    position: position, 
    rotation: rotation 
  });
}
setInterval(sendUpdate, 60);

socket.on("player update", (stuff) => {
  if (stuff.id !== playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-entity");
    let newPlayerHitbox = document.createElement("a-cylinder");

    newPlayer.setAttribute("gltf-model", "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/runningSweatshirt.glb?v=1724334083180");
    newPlayer.setAttribute("scale", "3 3 3");
    newPlayer.setAttribute("visible", "true");
    newPlayer.setAttribute("move", "heiw");
    // Set initial rotation based on the received data
    newPlayer.setAttribute("rotation", `0 ${stuff.rotation.y} 0`);

    // Set up the hitbox
    newPlayerHitbox.setAttribute("static-body", { shape: "cylinder" });
    newPlayerHitbox.setAttribute("visible", "false");
    newPlayerHitbox.setAttribute("position", "0 0.5 0");
    newPlayerHitbox.setAttribute("height", "3.1");

    newPlayer.appendChild(newPlayerHitbox);
    players[stuff.id] = { 
      entity: newPlayer, 
      targetPosition: stuff.position, 
      targetRotationY: stuff.rotation.y 
    };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    players[stuff.id].targetPosition = stuff.position;
    players[stuff.id].targetRotationY = stuff.rotation.y+180;
  }
});

function animatePlayers() {
  Object.keys(players).forEach((id) => {
    let player = players[id];
    let currentPosition = player.entity.getAttribute("position");
    let currentRotation = player.entity.getAttribute("rotation");

    // Smooth position
    currentPosition.x += (player.targetPosition.x - currentPosition.x) * smoothness;
    currentPosition.y += (player.targetPosition.y - currentPosition.y) * smoothness;
    currentPosition.z += (player.targetPosition.z - currentPosition.z) * smoothness;

    // Smooth rotation (Y-axis only)
    currentRotation.y += (player.targetRotationY - currentRotation.y) * smoothness;

    player.entity.setAttribute("position", currentPosition);
    player.entity.setAttribute("rotation", currentRotation);
  });
  requestAnimationFrame(animatePlayers);
}

animatePlayers();

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
