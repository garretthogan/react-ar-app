import React, { Component } from 'react';
import { WebGLRenderer, Scene } from 'three';
import { ARView, ARPerspectiveCamera, ARReticle, ARUtils } from 'three.ar.js';
import VRControls from '../../utils/VRControls';
import MTLLoader from '../../utils/MTLLoader';

const ASSETS_URL = process.env.NODE_ENV === 'production' ? 'https://s3.amazonaws.com/gh-random-assets/astronaut/' : '../../assets/astronaut/';

class ARApp extends Component {
  componentDidMount() {
    ARUtils.getARDisplay().then((display) => {
      if (display) {
        this.vrDisplay = display;
        this.init();
      } else {
        ARUtils.displayUnsupportedMessage();
      }
    });
  }
  setupRenderer = () => {
    this.renderer = new WebGLRenderer({ alpha: true, canvas: document.getElementById('ar-app') });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;
  }
  init = () => {
    // Setup the three.js rendering environment
    this.setupRenderer();
    this.scene = new Scene();
    this.arView = new ARView(this.vrDisplay, this.renderer);
    this.camera = new ARPerspectiveCamera(this.vrDisplay, 60, window.innerWidth / window.innerHeight, 0.01, 100);
    this.reticle = new ARReticle(this.vrDisplay,
                                  0.03, // innerRadius
                                  0.04, // outerRadius
                                  0xf4f4f4, // color
                                  0.25); // easing
    this.scene.add(this.reticle);
    this.vrControls = new VRControls(this.camera);
  
    window.addEventListener('resize', this.onWindowResize, false);
  
    this.loadMaterial();
    this.update();
  }
  update = () => {
    // Clears color from the frame before rendering the camera (arView) or scene.
    this.renderer.clearColor();
  
    // Render the device's camera stream on screen first of all.
    // It allows to get the right pose synchronized with the right frame.
    this.arView.render();
  
    // Update our camera projection matrix in the event that
    // the near or far planes have updated
    this.camera.updateProjectionMatrix();
  
    // Update our ARReticle's position, and provide normalized
    // screen coordinates to send the hit test -- in this case, (0.5, 0.5)
    // is the middle of our screen
    this.reticle.update(0.5, 0.5);
  
    // Update our perspective camera's positioning
    this.vrControls.update();
  
    // Render our three.js virtual scene
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
  
    // Kick off the requestAnimationFrame to call this function
    // when a new VRDisplay frame is rendered
    this.vrDisplay.requestAnimationFrame(this.update);
  }
  loadMaterial = () => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(ASSETS_URL);
    mtlLoader.load('Astronaut.mtl', materials => {
      materials.preload();
      console.log({materials});
      // this.loadModel(materials.materials.Astronaut_mat);
    });
  };  
  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }  
  render() {
    return (
      <canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden'
        }}
        id="ar-app"
      />
    );
  }
}

export default ARApp;
