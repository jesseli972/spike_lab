import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NET_HEIGHT_MEN, PHYSICS_DT } from './constants.js';
import { createCourt } from './scene/court.js';
import { createGym } from './scene/gym.js';
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

addLights(scene, renderer);
scene.add(createGym());
let court = createCourt(NET_HEIGHT_MEN);
scene.add(court);
const ball = createBall();
ball.setVisible(false);
scene.add(ball.mesh);
const trail = createTrail(0xffcc00);
scene.add(trail.object3d);
const marker = createMarker();
scene.add(marker.object3d);
const rig = createCameraRig(camera, controls);
const readout = createReadout();

const playback = { result: null, time: 0, playing: false, timeScale: 1 };
const spin = new THREE.Quaternion();
const spinAxis = new THREE.Vector3();
const spinStep = new THREE.Quaternion();
let spinRate = 0;

function launch(l) {
  const result = simulate(l);
  playback.result = result;
  playback.time = 0;
  playback.playing = true;
  trail.setPath(result.samples);
  trail.reveal(0);
  marker.hide();
  readout.clear();
  rig.setServerPos(l.pos);
  spin.identity();
  spinAxis.copy(result.omega);
  spinRate = spinAxis.length();
  if (spinRate > 0) spinAxis.divideScalar(spinRate);
  ball.setVisible(true);
}

function disposeCourt(group) {
  group.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.dispose();
    o.material.map?.dispose();
    o.material.dispose();
  });
}

const panel = createPanel({
  viewNames: rig.names,
  onLaunch: launch,
  onViewChange: (name) => rig.setView(name),
  onNetHeightChange: (h) => {
    scene.remove(court);
    disposeCourt(court);
    court = createCourt(h);
    scene.add(court);
  },
});
rig.setServerPos(panel.getLaunch().pos);

// Samples are PHYSICS_DT apart except the last, which sits at the contact point.
function positionAt(samples, t) {
  const i = Math.min(Math.floor(t / PHYSICS_DT), samples.length - 2);
  const a = samples[i];
  const b = samples[i + 1];
  const span = b.t - a.t;
  const f = span > 0 ? Math.min(Math.max((t - a.t) / span, 0), 1) : 1;
  return {
    pos: {
      x: a.pos.x + (b.pos.x - a.pos.x) * f,
      y: a.pos.y + (b.pos.y - a.pos.y) * f,
      z: a.pos.z + (b.pos.z - a.pos.z) * f,
    },
    vel: a.vel,
  };
}

function step(dt) {
  const { result } = playback;
  playback.time += dt * playback.timeScale;
  spinStep.setFromAxisAngle(spinAxis, spinRate * dt * playback.timeScale);
  spin.premultiply(spinStep);

  const done = playback.time >= result.flightTime;
  const last = result.samples[result.samples.length - 1];
  const s = done ? last : positionAt(result.samples, playback.time);
  if (done) playback.time = result.flightTime;

  ball.setState(s.pos, spin);
  trail.reveal(playback.time);
  rig.update(dt, s.pos, s.vel);

  if (done) {
    playback.playing = false;
    marker.show(result.landing, result.outcome);
    if (result.outcome === 'net') court.userData.hitNet(last.pos);
    readout.show(result);
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const timer = new THREE.Timer();
timer.connect(document);
renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const dt = timer.getDelta();
  // controls first, so the rig's minimum-height clamp applies last
  controls.update();
  if (playback.playing) step(dt);
  else rig.update(dt, null, null);
  renderer.render(scene, camera);
});
