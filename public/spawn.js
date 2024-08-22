document.addEventListener('DOMContentLoaded', function() {
  let player = document.getElementById("player");
  let body = document.getElementById("body");
  let x = (Math.random()*10);
  let z = (Math.random()*10);
    player.setAttribute("position", {x: x, y: 5, z: z})
   player.setAttribute("dynamic-body", "shape", "sphere")
  body.setAttribute("position", {x: x, y: 7, z: z})
   body.setAttribute("dynamic-body", "shape", "box")
});