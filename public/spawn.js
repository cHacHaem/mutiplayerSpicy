document.addEventListener('DOMContentLoaded', function() {
  let player = document.getElementById("player");
  let x = (Math.random()*10);
  let z = (Math.random()*10);
    player.setAttribute("position", {x: x, y: 5, z: z})
   player.setAttribute("dynamic-body", "shape", "sphere")
});