AFRAME.registerComponent('cannon-physics', {
  schema: {
    mass: {type: 'number', default: 0}, // default is static object
  },
  
  init: function () {
    const el = this.el;
    const data = this.data;

    // Wait for the model to load
    el.addEventListener('model-loaded', () => {
      // Get the 3D mesh from the model
      const mesh = el.getObject3D('mesh');
      if (!mesh) {
        console.error('No mesh found on the GLTF model.');
        return;
      }

      // Create Cannon.js shape from geometry
      let geometry = mesh.geometry;
      let vertices = [], faces = [];

      // Convert BufferGeometry to Cannon.js vertices and faces
      geometry.attributes.position.array.forEach((v, i) => {
        vertices.push(new CANNON.Vec3(
          geometry.attributes.position.array[i*3],
          geometry.attributes.position.array[i*3 + 1],
          geometry.attributes.position.array[i*3 + 2]
        ));
      });

      for (let i = 0; i < geometry.index.array.length; i += 3) {
        faces.push([
          geometry.index.array[i],
          geometry.index.array[i+1],
          geometry.index.array[i+2]
        ]);
      }

      let shape = new CANNON.ConvexPolyhedron(vertices, faces);

      // Create the physics body
      this.body = new CANNON.Body({
        mass: data.mass,
        shape: shape
      });

      // Sync with A-Frame model position/rotation
      el.object3D.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
      el.object3D.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z);

      // Add to Cannon.js world (assuming 'world' is already created)
      world.addBody(this.body);
    });
  },

  tick: function () {
    // Sync Cannon.js physics with A-Frame object
    const el = this.el;
    el.object3D.position.copy(this.body.position);
    el.object3D.quaternion.copy(this.body.quaternion);
  }
});
