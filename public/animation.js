AFRAME.registerComponent('move', {
  init: function () {
    setTimeout( () => {
      let position = this.el.getAttribute("position")
   console.log(this.el.components['gltf-model'].model )
            // Create an AnimationMixer, and get the list of AnimationClip instances
      const mixer = new THREE.AnimationMixer( this.el.components['gltf-model'].model);
      const clips = this.el.components['gltf-model'].model.animations[0];
      var clock = new THREE.Clock();
      // Play all animations
    mixer.clipAction( clips ).play();

      var delta = 0.25 * clock.getDelta();
      mixer.update( delta );
    }, 2000)
  }
})