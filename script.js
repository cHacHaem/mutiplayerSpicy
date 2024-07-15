AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.forceAmount = 100; // Adjust this value for the desired movement speed

    // Event listener for when the body is loaded
    this.el.addEventListener('body-loaded', () => {
      const el = this.el;

      // Create a custom material with zero friction
      const zeroFrictionMaterial = new CANNON.Material('zeroFrictionMaterial');

      // Define contact material for zero friction with itself
      const zeroFrictionContactMaterial = new CANNON.ContactMaterial(
        zeroFrictionMaterial,
        zeroFrictionMaterial,
        {
          friction: 0,
          restitution: 0.3 // Adjust restitution (bounciness) as needed
        }
      );

      // Apply the zero friction material to the player's body
      el.body.material = zeroFrictionMaterial;
      el.body.world.addContactMaterial(zeroFrictionContactMaterial);

      // Prevent rotation by locking angular motion
      el.body.angularFactor.set(0, 0, 0);
    });

    // Event listeners for key presses
    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });
  },

  // Tick function for continuous movement
  tick: function () {
    const el = this.el;
    const force = new CANNON.Vec3();
    const forceAmount = this.forceAmount;

    // Applying forces based on key presses
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

    // Applying the calculated force
    if (!force.almostZero()) {
      el.body.applyForce(force, el.body.position);
    }
  }
});

// Assigning the player-controls component to the player entity
document.querySelector('#player').setAttribute('player-controls', '');
