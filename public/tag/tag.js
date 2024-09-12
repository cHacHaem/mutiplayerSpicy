/* global playerId socket player players */
let whoIt = "";
let itMarker = document.createElement("a-sphere").setAttribute("color", "red");
// add tag cooldown
console.log(playerId);
player.addEventListener('collide', function (e) {
  let otherDude = e.detail.body.el.id;
  console.log(otherDude);
  if(otherDude == whoIt) {
    socket.emit("player tagged", playerId);
  tagPlayer(playerId);
  } else if(otherDude in players) {
    socket.emit("player tagged", otherDude);
    tagPlayer(otherDude);
  }
});
function tagPlayer(taggedPlayer) {
  if(playerId == taggedPlayer) {
    player.appendChild(itMarker)
  } else {
    players[taggedPlayer].entity.appendChild(itMarker); 
  }
  whoIt = taggedPlayer;
  console.log(players[taggedPlayer]);
}