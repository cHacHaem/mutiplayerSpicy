document.addEventListener("DOMContentLoaded", (event) => {
  let map = document.getElementById("map")
console.log(map)
console.warn("hiiii")
for(let i = 0; i < 10; i++){
  let rock = document.createElement("a-entity")
  rock.mixin = "rock"
  rock.position = {x: Math.random()*50, y: 0, z: Math.random()*50}
  rock.scale = {x: Math.random()*3, y: Math.random()*3, z: Math.random()*3}
  map.appendChild(rock)
  console.log(rock)
}
});
