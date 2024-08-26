AFRAME.registerComponent('move', {
  init: function () {
    this.setupModel();
    this.el.addEventListener('model-loaded', () => {
      // When the model is loaded, set up the animation
      this.setupModel();
      console.log("Model loaded and animation setup");
    });
  },

  setupModel: function () {
    const model = this.el.getObject3D('mesh');
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
  },

  tick: function (time, timeDelta) {
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }
});
