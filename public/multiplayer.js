const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let players = {};
let smoothness = 0.1; // Adjust this value to control how smooth the movement is
let movementThreshold = 0.01; // Threshold for detecting movement

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
      previousPosition: { ...stuff.position }, 
      targetRotationY: stuff.rotation.y + 180, 
      isMoving: false 
    };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    let player = players[stuff.id];
    player.targetPosition = stuff.position;
    player.targetRotationY = stuff.rotation.y + 180;
    //make player animation models prefabs!!!!!!! this alows for quicker changing
  
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

    // Check if the player is still moving, with threshold
    console.log(Math.abs(player.previousPosition.y - player.targetPosition.y))
    if (Math.abs(player.previousPosition.x - player.targetPosition.x) > movementThreshold ||
        Math.abs(player.previousPosition.y - player.targetPosition.y) > movementThreshold ||
        Math.abs(player.previousPosition.z - player.targetPosition.z) > movementThreshold) {
      player.isMoving = true;
    } else {
      player.isMoving = false;
    }
  console.log(player.isMoving)
    if (player.isMoving) {
      player.entity.setAttribute("gltf-model", "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/runningSweatshirt.glb?v=1724334083180");
    } else {
      player.entity.setAttribute("gltf-model", "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/breathingIdleSweatshirt.glb?v=1724359581798");
    }
    // Update the previous position for the next frame
    player.previousPosition = { ...player.targetPosition };
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
