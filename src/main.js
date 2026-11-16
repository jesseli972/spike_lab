import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NET_HEIGHT_MEN } from './constants.js';
import { createCourt } from './scene/court.js';
import { createBall } from './scene/ball.js';
import { addLights } from './scene/lights.js';
import { createTrail } from './scene/trail.js';
import { createMarker } from './scene/marker.js';
import { simulate } from './physics/simulate.js';
import { createCameraRig } from './cameras/rig.js';
import { createPanel } from './ui/panel.js';
import { createReadout } from './ui/readout.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(-16, 10, 14);
const controls = new OrbitControls(camera, renderer.domElement);

// Temporary until the court exists.
scene.add(new THREE.GridHelper(20, 20));

addLights(scene, renderer);
let court = createCourt(NET_HEIGHT_MEN);
scene.add(court);
const ball = createBall();
scene.add(ball.mesh);
const trail = createTrail(0xffcc00);
scene.add(trail.object3d);
const marker = createMarker();
scene.add(marker.object3d);
const rig = createCameraRig(camera, controls);
const readout = createReadout();

let result = null;
let flightT = 0;

function launch(l) {
  result = simulate(l);
  flightT = 0;
  trail.setPath(result.samples);
  marker.hide();
  readout.clear();
  ball.setVisible(true);
  rig.setServerPos(l.pos);
}

const panel = createPanel({
  viewNames: rig.names,
  onLaunch: launch,
  onViewChange: (name) => rig.setView(name),
  onNetHeightChange: (h) => {
    scene.remove(court);
    court = createCourt(h);
    scene.add(court);
  },
});
rig.setServerPos(panel.getLaunch().pos);

function sampleAt(samples, t) {
  return samples.find((s) => s.t >= t) ?? samples[samples.length - 1];
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  let s = null;
  if (result && result.samples.length) {
    flightT += dt;
    s = sampleAt(result.samples, flightT);
    ball.setState(s.pos, new THREE.Quaternion());
    trail.reveal(flightT);
    if (flightT >= result.flightTime) {
      if (result.landing) marker.show(result.landing, result.outcome);
      readout.show(result);
      result = null;
    }
  }
  rig.update(dt, s?.pos ?? null, s?.vel ?? null);
  controls.update();
  renderer.render(scene, camera);
});
