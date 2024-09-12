let whoIt = "";
let itMarker = document.createElement("a-sphere").setAttribute("color", "red");
// add tag cooldown
console.log(playerId)
player.addEventListener('collide', function (e) {
  let otherDude = e.detail.body.el.id;
  console.log(otherDude);
  if(otherDude == whoIt) {
    socket.emit("player tagged", playerId)
    whoIt = playerId
  } else if(otherDude in players) {
    socket.emit("player tagged", otherDude)
    whoIt = otherDude
  }
});
function tagPlayer(taggedPlayer) {
  players[taggedPlayer].entity.appendChild()
}