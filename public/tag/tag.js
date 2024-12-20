/* global playerId socket player players */
let whoIt = "";
let done = false;
let gameStarted = false;
let it = document.getElementById("it")
let timeLeftEl = document.getElementById("timeleft")
 // Adjust size if necessary
//each plauyer has marker just change visibility
console.log(playerId);
socket.on("game start", (itFirst)=>{
  setTimeout(()=>{
     tagPlayer(itFirst)
  gameStarted = true;
    timeLeftEl.innerHTML = "Game Started"
  }, 2000)
})
socket.on("world", (world)=>{
  it.innerHTML ="world: " + world
      if(!done) {
    let map = document.getElementById("map")
for(let i = 0; i < 30; i++){
  let rock = document.createElement("a-entity")
  rock.setAttribute("mixin", "rock")
  let xp = (Math.random()*100)-50;
  let yp = (Math.random()*100)-50;
  rock.setAttribute("position", {x: xp, y: 0, z: yp})
  let x, y, z = 0;
  while(x < 1) x = Math.random()*3
  while(y < 1) y = Math.random()*3
  while(z < 1) z = Math.random()*3
  rock.setAttribute("scale", {x: x, y: y, z})
  map.appendChild(rock)
  done = true;
}}
})
socket.on("game over", (game)=>{
  gameStarted = false;
  timeLeftEl.innerHTML = "";
  it.setAttribute("class", "it");
  it.innerHTML = "Game Over";
})
socket.on("time to start", (time)=>{
  if(time == "waiting for players...") {
    timeLeftEl.innerHTML = time;
  } else {
    timeLeftEl.innerHTML = "Time To Start: " + formatTime(time)
  }
})
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // Pad the seconds with a leading zero if less than 10
  const paddedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  return minutes + ':' + paddedSeconds;
}
// Example usage
console.log(formatTime(60));  // Output: 1:00
console.log(formatTime(75));  // Output: 1:15
console.log(formatTime(45));  // Output: 0:45
socket.on("time left", (left)=>{
  timeLeftEl.innerHTML = formatTime(left)
})
player.addEventListener('collide', function (e) {
  if(gameStarted) {
    let otherDude = e.detail.body.el.id;
  
  // If the player is colliding with the current "it"
  if (otherDude === whoIt) {
    socket.emit("player tagged", playerId);
    tagPlayer(playerId);
  } 
  // If the other player is valid and in the game
  else if (otherDude in players) {
    socket.emit("player tagged", otherDude);
    tagPlayer(otherDude);
  }
  }
});

socket.on("player tagged", (evt) => {
  tagPlayer(evt)
  console.log("player tagged: ", evt)
});

// Function to handle tagging logic
function tagPlayer(taggedPlayer) {
  console.log("putting it on: ", taggedPlayer);
  
  // Remove the marker from the current "it" player
  if (whoIt && whoIt !== playerId) {
    const currentMarker = document.getElementById("marker" + whoIt);
    if (currentMarker) {
      currentMarker.setAttribute("visible", "false");
    }
  }

  // If the current player is not the one tagged
  if (playerId !== taggedPlayer) {
    it.innerHTML = "Run Away!";
    it.setAttribute("class", "notit");
  }

  // If the current player is tagged
  if (playerId === taggedPlayer) {
    it.innerHTML = "You're It!";
    it.setAttribute("class", "it");
  } else {
    // Ensure the tagged player exists in the game
    const newMarker = document.getElementById("marker" + taggedPlayer);
    if (newMarker) {
      newMarker.setAttribute("visible", "true");  // Add the marker to the tagged player
    }
  }

  whoIt = taggedPlayer;  // Update who is "it"
}
