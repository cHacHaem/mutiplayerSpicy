let whoIt = "";
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