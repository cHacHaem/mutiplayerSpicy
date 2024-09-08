AFRAME.registerComponent('convex-static-body', {
  init: function () {
    const el = this.el;

    // Wait for the model to load before accessing its geometry
    el.addEventListener('model-loaded', () => {
      const mesh = el.getObject3D('mesh');
      if (!mesh) {
        console.error('No mesh found on the GLTF model.');
        return;
      }

      // Traverse the mesh to find the geometry
      mesh.traverse((child) => {
        if (child.isMesh) {
          const geometry = child.geometry;

          if (!geometry || !geometry.attributes || !geometry.attributes.position) {
            console.error('No geometry attributes found on this mesh.');
            return;
          }

          // Create the vertices and faces for the ConvexPolyhedron shape
          let vertices = [];
          let faces = [];

          const positions = geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            vertices.push([positions[i], positions[i + 1], positions[i + 2]]);
          }

          for (let i = 0; i < geometry.index.array.length; i += 3) {
            faces.push([
              geometry.index.array[i],
              geometry.index.array[i + 1],
              geometry.index.array[i + 2]
            ]);
          }

          // Set the shape attribute of the static body
          el.setAttribute('static-body', {
            shape: {
              type: 'convexPolyhedron',
              vertices: vertices,
              faces: faces
            }
          });

          console.log('Convex Polyhedron shape applied to static body.');
        }
      });
    });
  }
});
