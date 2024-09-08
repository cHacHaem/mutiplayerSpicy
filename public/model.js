let sceneEl = document.querySelector("a-scene")
let world;
sceneEl.addEventListener('loaded', function () {
  world = sceneEl.systems['physics'].driver.world;
  console.log('Cannon.js World:', world);
});
AFRAME.registerComponent('cannon-physics', {
  schema: {
    mass: { type: 'number', default: 0 } // static by default
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    // Wait for the model to load
    el.addEventListener('model-loaded', () => {
      const mesh = el.getObject3D('mesh');
      
      if (!mesh) {
        console.error('No mesh found on the GLTF model.');
        return;
      }

      // Traverse to get all the meshes (GLTF models can have multiple)
      mesh.traverse((child) => {
        if (child.isMesh) {
          const geometry = child.geometry;

          if (!geometry || !geometry.attributes || !geometry.attributes.position) {
            console.error('No geometry attributes found on this mesh.');
            return;
          }

          let vertices = [];
          let faces = [];

          // Extract vertices from BufferGeometry
          const positions = geometry.attributes.position.array;
          console.log(positions)
          for (let i = 0; i < positions.length; i += 3) {
            vertices.push(new CANNON.Vec3(
              positions[i],
              positions[i + 1],
              positions[i + 2]
            ));
          }

          // Extract faces
          for (let i = 0; i < geometry.index.array.length; i += 3) {
            faces.push([
              geometry.index.array[i],
              geometry.index.array[i + 1],
              geometry.index.array[i + 2]
            ]);
          }
          console.log(vertices, faces)
          // Create Cannon.js shape
          let shape = new CANNON.ConvexPolyhedron(vertices, faces);

          // Create the physics body
          this.body = new CANNON.Body({
            mass: data.mass,  // 0 for static, >0 for dynamic
            shape: shape
          });

          // Add the body to the physics world
          world.addBody(this.body);
          
          // Sync position and rotation
          this.body.position.copy(el.object3D.position);
          this.body.quaternion.copy(el.object3D.quaternion);
        }
      });
    });
  },

  tick: function () {
    if (this.body) {
      // Sync Cannon.js body with A-Frame object
      this.el.object3D.position.copy(this.body.position);
      this.el.object3D.quaternion.copy(this.body.quaternion);
    }
  }
});
