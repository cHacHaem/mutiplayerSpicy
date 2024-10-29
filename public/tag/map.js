let done = false;
document.addEventListener("click", (event) => {
  if(!done) {
    let map = document.getElementById("map")
console.log(map)
console.warn("hiiii")
for(let i = 0; i < 30; i++){
  let rock = document.createElement("a-entity")
  rock.setAttribute("mixin", "rock")
  rock.setAttribute("position", {x: (Math.random()*100)-50, y: 0, z: (Math.random()*100)-50})
  let x, y, z = 0;
  while(x < 1) x = Math.random()*3
  while(y < 1) y = Math.random()*3
  while(z < 1) z = Math.random()*3
  rock.setAttribute("scale", {x: x, y: y, z})
  map.appendChild(rock)
  console.log(rock)
  done = true;
}}
});
