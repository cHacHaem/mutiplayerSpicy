/* global playerId socket player players */
let whoIt = "";
let itMarker = document.createElement("a-sphere");
itMarker.setAttribute("color", "red");
itMarker.setAttribute("radius", "0.5");  // Adjust size if necessary

console.log(playerId);

player.addEventListener('collide', function (e) {
  let otherDude = e.detail.body.el.id;
  console.log(otherDude);
  
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
});

// Listen for the "player tagged" event from the server
socket.on("player tagged", (evt) => {
  whoIt = evt;
  console.log(`Player tagged: ${whoIt}`);
});

// Function to handle tagging logic
function tagPlayer(taggedPlayer) {
  // Remove the marker from the current "it" player if there's already one tagged
  if (whoIt && players[whoIt] && players[whoIt].entity) {
    players[whoIt].entity.removeChild(itMarker);  // Remove the marker from the previous "it"
  }

  // If the current player is tagged
  if (playerId === taggedPlayer) {
    player.appendChild(itMarker);  // Add the marker to the current player
  } else {
    // Ensure the tagged player exists in the game
      players[taggedPlayer].entity.appendChild(itMarker);  // Add the marker to the tagged player
  }

  whoIt = taggedPlayer;  // Update who is "it"
  console.log(players[taggedPlayer]);
}
