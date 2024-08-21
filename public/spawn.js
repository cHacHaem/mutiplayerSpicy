document.addEventListener('DOMContentLoaded', function() {
  let player = document.getElementById("player");
    player.setAttribute("position", {x: (Math.random()*10), y: 5, z: (Math.random()*10)})
   player.setAttribute("dynamic-body", "shape", "sphere")
});