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

            // Get the world matrix of the node to account for transformations
            const worldMatrix = node.matrixWorld;

            // Store clusters of vertices for detecting box-like shapes
            const clusters = [];
            const threshold = 0.5; // Distance threshold to group vertices (adjustable)

            // Loop through vertices to group them into clusters
            for (let i = 0; i < vertices.length; i += 3) {
              // Apply world matrix transformations to the vertex
              const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
              vertex.applyMatrix4(worldMatrix); // Adjust the vertex with the world matrix

              let addedToCluster = false;

              // Try to add the vertex to an existing cluster
              for (let cluster of clusters) {
                if (vertex.distanceTo(cluster.center) < threshold) {
                  cluster.points.push(vertex);
                  cluster.center.add(vertex).divideScalar(2); // Update the center of the cluster
                  addedToCluster = true;
                  break;
                }
              }

              // If the vertex doesn't fit into an existing cluster, create a new one
              if (!addedToCluster) {
                clusters.push({ center: vertex.clone(), points: [vertex] });
              }
            }

            // For each cluster, create a bounding box
            clusters.forEach((cluster, index) => {
              if (cluster.points.length >= 3) { // If the cluster has enough points to define a box
                const bbox = new THREE.Box3().setFromPoints(cluster.points);
                const size = bbox.getSize(new THREE.Vector3());
                const offset = bbox.getCenter(new THREE.Vector3());

                // Add a bounding box shape for this cluster
                el.setAttribute(`shape__${node.name}_cluster${index}`, {
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
  }
});
