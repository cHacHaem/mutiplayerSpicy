let sceneEl = document.querySelector("a-scene")
var el = sceneEl.querySelector('#nyan');
console.log(el)
el.body.applyImpulse(
  /* impulse */        new CANNON.Vec3(0, 1, -1),
  /* world position */ new CANNON.Vec3().copy(el.getAttribute('position'))
);