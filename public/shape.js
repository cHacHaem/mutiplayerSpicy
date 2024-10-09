AFRAME.registerComponent('generate-physics-shapes', {
  init: function () {
    const el = this.el;

    // Wait for the model to load
    el.addEventListener('model-loaded', () => {
      const model = el.getObject3D('mesh');

      if (model) {
        // Traverse through all the meshes in the model
        model.traverse(function (node) {
         
          if (node.isMesh && node.geometry) {
            const geometry = node.geometry;
            const vertices = geometry.attributes.position.array;
            console.log(vertices)

            // Initialize arrays to store potential box-like vertices
            const boxVertices = [];

            // Loop through vertices and group them by proximity
            for (let i = 0; i < vertices.length; i += 3) {
              const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);

              // You can define conditions here to filter "box-like" structures,
              // e.g., detecting axis-aligned points or symmetrical groups of vertices
              // Example: if vertices align on major axes, consider it a box-like structure
              if (Math.abs(vertex.x) < 0.1 || Math.abs(vertex.y) < 0.1 || Math.abs(vertex.z) < 0.1) {
                boxVertices.push(vertex);
              }
            }

            // If enough vertices align to form a box, create a bounding box
            if (boxVertices.length >= 8) { // Assuming a box needs 8 corner points
              const bbox = new THREE.Box3().setFromPoints(boxVertices);
              const size = bbox.getSize(new THREE.Vector3());
              const offset = bbox.getCenter(new THREE.Vector3());

              // Add a bounding box shape for this part
              el.setAttribute(`shape__${node.name}`, {
                shape: 'box',
                halfExtents: `${size.x / 2} ${size.y / 2} ${size.z / 2}`,
                offset: `${offset.x} ${offset.y} ${offset.z}`
              });
            }
          }
        });
      }
    });
  }
});
