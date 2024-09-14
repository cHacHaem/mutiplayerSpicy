/* global playerId socket player players */
let whoIt = "";
let it = document.getElementById("it")
 // Adjust size if necessary
//each plauyer has marker just change visibility
console.log(playerId);

player.addEventListener('collide', function (e) {
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
});

socket.on("player tagged", (evt) => {
  tagPlayer(evt)
});

// Function to handle tagging logic
function tagPlayer(taggedPlayer) {
  console.log("putting it on: ", taggedPlayer)
  // Remove the marker from the current "it" player if there's already one tagged
  if (whoIt && whoIt != playerId) {
       players[whoIt].entity.querySelector(".marker").setAttribute("visible", "false")
  }  else if(whoIt === playerId) {
    it.innerHTML = "Run Away!"
    it.setAttribute("class", "notit")
  }

  // If the current player is tagged
  if (playerId === taggedPlayer) {
    it.innerHTML = "Your It!"
    it.setAttribute("class", "it")
  } else {
    // Ensure the tagged player exists in the game
      players[taggedPlayer].entity.querySelector(".marker").setAttribute("visible", "true")  // Add the marker to the tagged player
  }

  whoIt = taggedPlayer;  // Update who is "it"
}
