AFRAME.registerComponent('move', {
  init: function () {
    this.setupModel();
  },

  update: function (oldData) {
    if (oldData['gltf-model'] !== this.el.getAttribute('gltf-model')) {
      // The model has changed, so set up the animation again
      this.setupModel();
      console.log("new animation")
    }
  },

  setupModel: function () {
    setTimeout(() => {
      const model = this.el.components['gltf-model'].model;
      if (!model) {
        console.error("Model not loaded yet!");
        return;
      }

      // Initialize the animation mixer with the new model
      this.mixer = new THREE.AnimationMixer(model);
      const clips = model.animations;

      // Play the "Move" animation
      const moveClip = clips.find(clip => clip.name === "Move");
      if (moveClip) {
        const action = this.mixer.clipAction(moveClip);
        action.play();
      } else {
        console.warn("Move animation not found on the model.");
      }

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
