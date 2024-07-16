AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.forceAmount = 100; // Adjust this value for the desired movement speed

    this.el.addEventListener('body-loaded', () => {
      const el = this.el;

      // Create a custom material with zero friction
      const zeroFrictionMaterial = new CANNON.Material('zeroFrictionMaterial');
      const zeroFrictionContactMaterial = new CANNON.ContactMaterial(
        {
          friction: 0,
          restitution: 0.3 // Adjust as needed
        }
      );

      // Apply the zero friction material to the player's body
      el.body.material = zeroFrictionMaterial;
      el.body.world.addContactMaterial(zeroFrictionContactMaterial);

      // Prevent rotation
      el.body.angularFactor.set(0, 0, 0);
    });

    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });
  },

  tick: function () {
    const el = this.el;
    const camera = el.querySelector('#cam'); // Get the camera element
    const cameraWorldDirection = new THREE.Vector3();
    camera.object3D.getWorldDirection(cameraWorldDirection); // Get the camera's forward direction
    cameraWorldDirection.y = 0; // Ignore vertical direction for movement
    cameraWorldDirection.normalize(); // Normalize the vector

    const force = new CANNON.Vec3();
    const forceAmount = this.forceAmount;

    if (this.keys['w'] || this.keys['ArrowUp']) {
      force.x -= cameraWorldDirection.x * forceAmount;
      force.z -= cameraWorldDirection.z * forceAmount;
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      force.x += cameraWorldDirection.x * forceAmount;
      force.z += cameraWorldDirection.z * forceAmount;
    }
    if (this.keys['a'] || this.keys['ArrowLeft']) {
      force.x -= cameraWorldDirection.z * forceAmount;
      force.z += cameraWorldDirection.x * forceAmount;
    }
    if (this.keys['d'] || this.keys['ArrowRight']) {
      force.x += cameraWorldDirection.z * forceAmount;
      force.z -= cameraWorldDirection.x * forceAmount;
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
