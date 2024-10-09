AFRAME.registerComponent('generate-physics-shapes', {
  init: function () {
    const el = this.el;

    // Wait for the model to load
    el.addEventListener('model-loaded', () => {
      const model = el.getObject3D('mesh');
      
      if (model) {
        model.traverse(function (node) {
          if (node.isMesh && node.geometry) {
            // Compute the bounding box directly from the mesh geometry
            const bbox = new THREE.Box3().setFromObject(node);
            const size = bbox.getSize(new THREE.Vector3());
            const offset = bbox.getCenter(new THREE.Vector3());

            // Divide the bounding box into smaller segments (if needed)
            const numDivisions = 5; // Number of bounding boxes to generate
            const divisionSize = new THREE.Vector3(
              size.x / numDivisions,
              size.y / numDivisions,
              size.z / numDivisions
            );

            // Generate smaller bounding boxes based on the divisions
            for (let i = 0; i < numDivisions; i++) {
              // Adjust the position of each smaller bounding box based on division
              const partOffset = new THREE.Vector3(
                offset.x + i * divisionSize.x - (size.x / 2) + (divisionSize.x / 2),
                offset.y + i * divisionSize.y - (size.y / 2) + (divisionSize.y / 2),
                offset.z + i * divisionSize.z - (size.z / 2) + (divisionSize.z / 2)
              );

              // Add a bounding box shape for each segment
              el.setAttribute(`shape__${node.name}_${i}`, {
                shape: 'box',
                halfExtents: `${divisionSize.x / 2} ${divisionSize.y / 2} ${divisionSize.z / 2}`,
                offset: `${partOffset.x} ${partOffset.y} ${partOffset.z}`
              });
            }
          }
        });
      }
    });
  }
});
