/* global playerId socket player players */
let whoIt = "";
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
  timeLeftEl.innerHTML ="world: " + world
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
});

// Function to handle tagging logic
function tagPlayer(taggedPlayer) {
  console.log("putting it on: ", taggedPlayer)
  // Remove the marker from the current "it" player if there's already one tagged
  if (whoIt && whoIt != playerId) {
       document.getElementById("marker"+taggedPlayer).setAttribute("visible", "false")
  }  else if(playerId != taggedPlayer) {
    it.innerHTML = "Run Away!"
    it.setAttribute("class", "notit")
  }

  // If the current player is tagged
  if (playerId === taggedPlayer) {
    it.innerHTML = "Your It!"
    it.setAttribute("class", "it")
  } else {
    // Ensure the tagged player exists in the game
       if(document.getElementById("marker"+taggedPlayer)) document.getElementById("marker"+taggedPlayer).setAttribute("visible", "true")  // Add the marker to the tagged player
  }

  whoIt = taggedPlayer;  // Update who is "it"
}