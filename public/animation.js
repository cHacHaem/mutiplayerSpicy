AFRAME.registerComponent('move', {
  init: function () {
    setTimeout(() => {
      const model = this.el.components['gltf-model'].model;
      if (!model) {
        console.error("Model not loaded yet!");
        return;
      }
      
      this.mixer = new THREE.AnimationMixer(model);
      const clips = model.animations;

      // Play all animations
      clips.forEach(clip => {
        const action = this.mixer.clipAction("Running");
        action.play();
      });

      this.clock = new THREE.Clock();
    }, 2000);
  },
  
  tick: function (time, timeDelta) {
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }
});