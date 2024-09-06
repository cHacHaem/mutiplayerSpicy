const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let players = {};
let smoothness = 0.1; // Adjust this value to control how smooth the movement is
let message = prompt("message")
socket.emit("chat message", {message: message, time: Date.now()})
function sendUpdate() {
  const position = player.getAttribute("position");
  const rotation = cam.getAttribute("rotation");
  const velocity = player.body.velocity;  // Assuming you have Cannon.js or similar physics library
  let movementState = 'idle';  // Default to 'idle'

  // Convert degrees to radians manually
  function degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate forward vector from camera rotation (Y-axis)
  const rad = degToRad(rotation.y);
  const forwardVector = {
    x: -Math.sin(rad),
    z: -Math.cos(rad)
  };

  // Calculate velocity direction (normalized)
  const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
  const velocityDir = {
    x: velocity.x / velocityMagnitude,
    z: velocity.z / velocityMagnitude
  };

  // Calculate dot product to determine movement direction relative to the camera
  const dotProduct = forwardVector.x * velocityDir.x + forwardVector.z * velocityDir.z;

  // Calculate the angle in degrees between the forward vector and velocity direction
  const angle = Math.acos(dotProduct) * (180 / Math.PI);  // Convert radians to degrees

  // Detect if the player is in the air (jumping or falling)
  const isJumping = Math.abs(velocity.y) > 0.1;  // Set a threshold to detect jump
  if (isJumping) {
    movementState = 'jumping';
  } else if (velocityMagnitude > 2) {  // Assuming 2 is the threshold for 'running'
    if (angle < 30) {  // Running forward (within a 30-degree cone in front)
      movementState = 'running_forward';
    } else if (angle > 150) {  // Running backward
      movementState = 'running_back';
    } else if (velocityDir.x * forwardVector.z - velocityDir.z * forwardVector.x > 0) {
      movementState = 'running_left';  
    } else if (velocityDir.x * forwardVector.z - velocityDir.z * forwardVector.x < 0) {
      movementState = 'running_right';  
    }
  } else if (velocityMagnitude > 0.1) {
    movementState = 'walking';
  }

  socket.emit("player update", { 
    id: playerId, 
    position: position, 
    rotation: rotation,
    movementState: movementState  // Send the determined movement state
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
      targetRotationY: stuff.rotation.y + 180, 
      currentModel: "#idleSweater", // Keep track of the current model
      movementState: stuff.movementState // Set initial movement state
    };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    let player = players[stuff.id];
    player.targetPosition = stuff.position;
    player.targetRotationY = stuff.rotation.y + 180;

    // Update the movement state if it has changed
    if (player.movementState !== stuff.movementState) {
      player.movementState = stuff.movementState;

      // Change the model only if the state has changed
      if (player.movementState === 'jumping' && player.currentModel !== "#jumpingSweater") {
        player.entity.setAttribute("move", "clip: Jumping");
        player.currentModel = "#jumpingSweater";
      } else if (player.movementState === 'running_forward' && player.currentModel !== "#runningSweater") {
        player.entity.setAttribute("move", "clip: Running");
        player.currentModel = "#runningSweater";
      } else if (player.movementState === 'running_left' && player.currentModel !== "#runningSweaterLeft") {
         player.entity.setAttribute("move", "clip: LeftRun");
        player.currentModel = "#runningSweaterLeft";
      } else if (player.movementState === 'running_right' && player.currentModel !== "#runningSweaterRight") {
        player.entity.setAttribute("move", "clip: RightRun");
        player.currentModel = "#runningSweaterRight";
      } else if (player.movementState === 'running_back' && player.currentModel !== "#runningSweaterBack") {
        player.entity.setAttribute("move", "clip: Idle");
        player.currentModel = "#runningSweaterBack";
      } else if (player.movementState === 'walking' && player.currentModel !== "#walkingSweater") {
        player.entity.setAttribute("move", "clip: Idle");
        player.currentModel = "#walkingSweater";
      } else if (player.movementState === 'idle' && player.currentModel !== "#idleSweater") {
        player.entity.setAttribute("move", "clip: Idle");
        player.currentModel = "#idleSweater";
      }
    }
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
