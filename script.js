let sceneEl = document.querySelector("a-scene")
var el = sceneEl.querySelector('#player');
console.log(el)
document.addEventListener("click", (event)=>{
  el.body.applyImpulse(
  /* impulse */        new CANNON.Vec3(0, 25, 0),
  /* world position */ new CANNON.Vec3().copy(el.getAttribute('position'))
);
})