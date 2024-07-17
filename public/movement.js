AFRAME.registerComponent('player-controls', {
  init: function () {
    this.keys = {};
    this.forceAmount = 200; // Adjust this value for the desired movement speed
    this.canJump = false; // To track if the player can jump
    this.touchingGround = false; // To track if the player is touching the ground
    this.rotationSpeed = 0.2; // Adjust this value for the rotation speed
    this.cameraDistance = 5; // Distance of the camera from the player

    // Create a container for the camera and its pivot point
    this.cameraContainer = document.querySelector('#cameraContainer');
    this.camera = this.cameraContainer.querySelector('a-camera');

    // Attach mousemove event listener for rotating the camera
    document.addEventListener('mousemove', (event) => {
      this.rotateCamera(event.movementX);
    });

    this.el.addEventListener('body-loaded', () => {
      const el = this.el;
      // Prevent rotation
      el.body.angularFactor.set(0, 0, 0);

      // Listen for collisions to determine if the player is touching a static body
      el.body.addEventListener('collide', (event) => {
        // Check if the collision is with a static body
        if (event.body.mass === 0) {
          const contact = event.contact;
          // Check the contact normal to determine if the player is on top of the body
          const contactNormal = contact.ni.clone();
          contactNormal.negate(contactNormal); // Flip the normal direction

          if (contactNormal.y > 0.5) { // Adjust this threshold as needed
            this.touchingGround = true; // Player is touching the top of a static body
          }
        }
      });

      el.body.addEventListener('endContact', (event) => {
        if (event.body.mass === 0) {
          this.touchingGround = false; // Reset touchingGround when contact ends
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });

    // Listen for other players' movements
    socket.on('playerMoved', (data) => {
      let otherPlayer = document.getElementById(data.playerId);
      if (!otherPlayer) {
        otherPlayer = document.createElement('a-sphere');
        otherPlayer.setAttribute('dynamic-body', '');
        otherPlayer.setAttribute('position', '0 5 0');
        otherPlayer.id = data.playerId;
        document.querySelector('a-scene').appendChild(otherPlayer);
      }
      otherPlayer.setAttribute('position', data.position);
    });
  },

  tick: function () {
    const el = this.el;
    const force = new CANNON.Vec3();
    const forceAmount = this.forceAmount;

    if (this.keys['w'] || this.keys['ArrowUp']) {
      this.movePlayer(el, force, forceAmount, 0);
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      this.movePlayer(el, force, -forceAmount, 0);
    }
    if (this.keys['a'] || this.keys['ArrowLeft']) {
      this.movePlayer(el, force, 0, -forceAmount);
    }
    if (this.keys['d'] || this.keys['ArrowRight']) {
      this.movePlayer(el, force, 0, forceAmount);
    }
    if (this.keys[' '] && this.touchingGround) { // Spacebar for jump
      force.y += forceAmount * 10;
      this.touchingGround = false; // Reset touchingGround until player lands again
    }

    if (!force.almostZero()) {
      el.body.applyForce(force, el.body.position);
    }

    // Update camera position based on player's position
    const playerPosition = el.getAttribute('position');
    this.cameraContainer.setAttribute('position', `${playerPosition.x} ${playerPosition.y + 1.6} ${playerPosition.z - this.cameraDistance}`);

    // Emit player's position to the server
  },

  rotateCamera: function (deltaX) {
    // Rotate the player (and indirectly the camera) based on mouse movement
    this.el.object3D.rotation.y -= deltaX * this.rotationSpeed * Math.PI / 180;
  },

  movePlayer: function (el, force, xForce, zForce) {
    const cameraWorldDirection = new THREE.Vector3();
    this.camera.object3D.getWorldDirection(cameraWorldDirection); // Get the camera's forward direction
    cameraWorldDirection.y = 0; // Ignore vertical direction for movement
    cameraWorldDirection.normalize(); // Normalize the vector

    force.x += cameraWorldDirection.x * xForce;
    force.z += cameraWorldDirection.z * zForce;
  }
});

document.querySelector('#player').setAttribute('player-controls', '');
