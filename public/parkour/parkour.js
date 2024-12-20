/* global playerId socket player players */
let done = false;
let gameStarted = false;
let timeLeftEl = document.getElementById("timeleft")
let gameId = document.getElementById("gameId")
 // Adjust size if necessary
//each plauyer has marker just change visibility
console.log(playerId);
socket.on("game start", (itFirst)=>{
  setTimeout(()=>{
  gameStarted = true;
    timeLeftEl.innerHTML = "Game Started"
  }, 2000)
})
socket.on("world", (world)=>{
  gameId.innerHTML ="world: " + world
})
socket.on("game over", (game)=>{
  gameStarted = false;
  timeLeftEl.innerHTML = "";
  gameId.setAttribute("class", "it");
  gameId.innerHTML = "Game Over";
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
