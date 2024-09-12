let whoIt = "";
console.log(playerId)
player.addEventListener('collide', function (e) {
  let otherDude = e.detail.body.el.id;
  console.log(otherDude);
  if(otherDude == whoIt) {
    socket.emit("player tagged", playerId)
  } else if(otherDude in players) {
    socket.emit("player tagged", otherDude)
  }
});