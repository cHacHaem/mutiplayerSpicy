const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let players = {};
let smoothness = 0.1; // Adjust this value to control how smooth the movement is
let movementThreshold = 0.01; // Threshold for detecting movement
let animationCooldown = 200; // 1 second cooldown to change animation
document.addEventListener("keydown", (evt)=>{
  
})
function sendUpdate() {
  const position = player.getAttribute("position");
  const rotation = cam.getAttribute("rotation");
  let running = false
  if(Math.abs(player.body.velocity.x) > 3 || Math.abs(player.body.velocity.z) > 3) {
    console.log("running")
    running = true;
  }
  socket.emit("player update", { 
    id: playerId, 
    position: position, 
    rotation: rotation,
    running: running
  });
}
setInterval(sendUpdate, 60);

socket.on("player update", (stuff) => {
  if (stuff.id !== playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-entity");
    let newPlayerHitbox = document.createElement("a-cylinder");

    newPlayer.setAttribute("gltf-model", "#idleSweater");
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
      previousTime: Date.now(),
      targetRotationY: stuff.rotation.y + 180, 
      isMoving: false,
      lastAnimationChange: Date.now(), // Store the time of the last animation change
    };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    let player = players[stuff.id];
    player.targetPosition = stuff.position;
    player.targetRotationY = stuff.rotation.y + 180;
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

    // Calculate velocity and determine if player is moving
    let currentTime = Date.now();
    let timeElapsed = (currentTime - player.previousTime) / 1000; // Convert milliseconds to seconds
    let velocity = {
      x: (player.targetPosition.x - player.previousPosition.x) / timeElapsed,
      y: (player.targetPosition.y - player.previousPosition.y) / timeElapsed,
      z: (player.targetPosition.z - player.previousPosition.z) / timeElapsed
    };
    
    let speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
    let wasMoving = player.isMoving;
    player.isMoving = speed > movementThreshold;
    player.previousTime = currentTime;

    // Change model only if movement state has changed and cooldown has passed
    if (player.isMoving !== wasMoving && (currentTime - player.lastAnimationChange) > animationCooldown) {
      if (player.isMoving) {
        console.log("changed to running");
        player.entity.setAttribute("gltf-model", "#idleSweater");
      } else {
        console.log("changed to idle");
        player.entity.setAttribute("gltf-model", "#runningSweater");
      }
      player.lastAnimationChange = currentTime; // Update the last animation change time
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
