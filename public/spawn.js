document.addEventListener('DOMContentLoaded', function() {
  let player = document.getElementById("player");
 function reSpawn() { 
   let player = document.getElementById("player");
  let x = (Math.random()*10);
  let z = (Math.random()*10);
    player.setAttribute("position", {x: x, y: 20, z: z})
   player.setAttribute("dynamic-body", {shape: "sphere", linearDamping: 0.9, angularDamping: 0.9})
 }
  reSpawn()
  setInterval(()=>{
    if(player.getAttribute("position".y < -10)) {
      reSpawn()
    }
  }, 60)
});