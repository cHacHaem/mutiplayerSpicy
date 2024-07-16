AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.forceAmount = 200; // Adjust this value for the desired movement speed
    this.canJump = false; // To track if the player can jump
    this.touchingGround = false; // To track if the player is touching the ground
    this.touchingRightSide = false; // To track if the player is touching the right side

    this.el.addEventListener('body-loaded', () => {
      const el = this.el;
      // Prevent rotation
      el.body.angularFactor.set(0, 0, 0);

      // Listen for collisions to determine if the player is touching a static body
      el.body.addEventListener('collide', (event) => {
        // Check if the collision is with a static body
        if (event.body.mass === 0) {
          // Iterate through the contact points to check the collision normal
          for (let i = 0; i < event.contact.ni.length; i++) {
            const contactNormal = event.contact.ni[i];
            console.log(contactNormal)
            if (contactNormal.y > 0.5) { // Adjust this threshold as needed
              this.touchingGround = true; // Player is touching the top of a static body
            }
            if (contactNormal.x < -0.5) { // Adjust this threshold as needed
              this.touchingRightSide = true; // Player is touching the right side of a static body
            }
          }
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
      this.touchingRightSide = false; // Reset the touching right side when key is released
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
    if (this.keys[' '] && this.touchingGround) { // Spacebar for jump
      force.y += forceAmount * 10;
      this.touchingGround = false; // Reset touchingGround until player lands
    }

    if (!force.almostZero()) {
      el.body.applyForce(force, el.body.position);
    }
  }
});

document.querySelector('#player').setAttribute('player-controls', '');
