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
            // Compute the bounding box for each mesh
            const bbox = new THREE.Box3().setFromObject(node);
            const size = bbox.getSize(new THREE.Vector3());
            const offset = bbox.getCenter(new THREE.Vector3());

            // Assign a bounding box shape for each mesh part
            el.setAttribute(`shape__${node.name}`, {
              shape: 'box',
              halfExtents: `${size.x / 2} ${size.y / 2} ${size.z / 2}`,
              offset: `${offset.x} ${offset.y} ${offset.z}`
            });
          }
        });
      }
    });
  }
});
