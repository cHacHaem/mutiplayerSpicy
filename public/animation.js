AFRAME.registerComponent('move', {
  schema: {
    clip: { type: 'string', default: 'Idle' }  // Add clip attribute with default value "Move"
  },

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

    // Get the clip name from the component's schema
    const clipName = this.data.clip;

    // Play the animation specified in the clip attribute
    const selectedClip = clips.find(clip => clip.name === clipName);
    if (selectedClip) {
      const action = this.mixer.clipAction(selectedClip);
      action.play();
    } else {
      console.warn(`Animation clip '${clipName}' not found on the model.`);
    }

    this.clock = new THREE.Clock();
  },

  update: function (oldData) {
    // When the clip attribute changes, update the animation
    if (oldData.clip !== this.data.clip) {
      this.setupModel();  // Re-run the animation setup when clip changes
    }
  },

  tick: function (time, timeDelta) {
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }
});
