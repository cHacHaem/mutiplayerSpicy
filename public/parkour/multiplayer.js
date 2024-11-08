/* mario cart, tag, knockback, spleef, shooting game, capture the flag. */
const socket = io();
const playerId = generateRandomString(20);
let player = document.querySelector("#player");
let cam = document.querySelector("#cam");
let scene = document.querySelector("a-scene");
let players = {};
let name;
let smoothness = 0.1; // Adjust this value to control how smooth the movement is
// Ensure player physics component is initialized
function checkPlayerBody() {
  if (!player || !player.body) {
    console.log("Waiting for player body to be defined...");
    setTimeout(checkPlayerBody, 100); // Check again after 100ms
  } else {
    setInterval(sendUpdate, 60); // Start sending updates after body is ready
  }
}

// Run the check as soon as the script runs
checkPlayerBody();

socket.on("player left", (evt) => {
  if (players[evt]) {
    players[evt].entity.parentNode.removeChild(players[evt].entity);
    delete players[evt];
  }
});

if (localStorage.getItem('name')) {
  name = localStorage.getItem('name');
} else {
  name = prompt("What is your player name?");
  localStorage.setItem("name", name);
}
socket.emit("world", { world: "parkour", id: playerId, name: name });
function sendUpdate() {
  if (player.body && player.body.velocity) {
    const position = player.getAttribute("position");
    const rotation = cam.getAttribute("rotation");
    const velocity = player.body.velocity;
    let movementState = 'idle';

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
    const angle = Math.acos(dotProduct) * (180 / Math.PI);

    // Detect if the player is in the air (jumping or falling)
    const isJumping = Math.abs(velocity.y) > 0.1;

    if (isJumping) {
      movementState = 'jumping';
    } else if (velocityMagnitude > 2) {
      if (angle < 30) {
        movementState = 'running_forward';
      } else if (angle > 150) {
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
      movementState: movementState,
    });
  }
}

socket.on("player update", (stuff) => {
  if (stuff.id !== playerId && !(stuff.id in players)) {
    let newPlayer = document.createElement("a-entity");
    let newPlayerHitbox = document.createElement("a-cylinder");

    newPlayer.setAttribute("gltf-model", "#playerSkin");
    newPlayer.setAttribute("scale", "3 3 3");
    newPlayer.setAttribute("visible", "true");
    newPlayer.setAttribute("move", "clip: Idle");
    newPlayer.setAttribute("rotation", `0 ${stuff.rotation.y} 0`);

    let itMarker = document.createElement("a-entity");
    itMarker.setAttribute("gltf-model", "#arrow");
    itMarker.setAttribute("id", "marker" + stuff.id);
    itMarker.setAttribute("position", "0 1 0");
    itMarker.setAttribute("visible", false);

    newPlayerHitbox.setAttribute("static-body", { shape: "cylinder" });
    newPlayerHitbox.setAttribute("visible", "false");
    newPlayerHitbox.setAttribute("position", "0 0.5 0");
    newPlayerHitbox.setAttribute("height", "3.1");
    newPlayerHitbox.setAttribute("id", stuff.id);

    newPlayer.appendChild(newPlayerHitbox);
    newPlayer.appendChild(itMarker);
    players[stuff.id] = {
      entity: newPlayer,
      targetPosition: stuff.position,
      previousPosition: { ...stuff.position },
      targetRotationY: stuff.rotation.y + 180,
      currentModel: "#idleSweater",
      movementState: stuff.movementState,
    };

    scene.appendChild(newPlayer);
  } else if (stuff.id in players) {
    let player = players[stuff.id];
    player.targetPosition = stuff.position;
    player.targetRotationY = stuff.rotation.y + 180;

    if (player.movementState !== stuff.movementState) {
      player.movementState = stuff.movementState;

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
        player.entity.setAttribute("move", "clip: BackRun");
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

    currentPosition.x += (player.targetPosition.x - currentPosition.x) * smoothness;
    currentPosition.y += (player.targetPosition.y - currentPosition.y - 1) * smoothness;
    currentPosition.z += (player.targetPosition.z - currentPosition.z) * smoothness;

    currentRotation.y += (player.targetRotationY - currentRotation.y) * smoothness;

    player.entity.setAttribute("position", currentPosition);
    player.entity.setAttribute("rotation", currentRotation);

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
