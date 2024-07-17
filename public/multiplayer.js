const socket = io();
const playerId = socket.id;
let player = document.querySelector("#player");
function sendUpdate() {
  socket.emit("position update", { playerId: playerId, position: player.getAttribute("position")});
}
setInterval(sendUpdate, 60)
console.log(playerId)
