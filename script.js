AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.forceAmount = 100; // Adjust this value for the desired movement speed

    document.addEventListener("keydown", (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.keys[event.key] = false;
    });
  },

  tick: function (time, timeDelta) {
    const el = this.el;
    const force = new CANNON.Vec3();
    const forceAmount = this.forceAmount;

    if (this.keys['w'] || this.keys['ArrowUp']) {
      force.z -= forceAmount;
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      force.z += forceAmount;
    }
    if (this.keys['a'] || this.keys['ArrowLeft']) {
      force.x -= forceAmount;
    }
    if (this.keys['d'] || this.keys['ArrowRight']) {
      force.x += forceAmount;
    }
    if (this.keys[' ']) { // Spacebar for jump
      force.y += forceAmount;
    }

    if (!force.almostZero()) {
      el.body.applyForce(force, el.body.position);
    }
  }
});

document.querySelector('#player').setAttribute('player-controls', '');
