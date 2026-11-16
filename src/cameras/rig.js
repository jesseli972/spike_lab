import * as THREE from 'three';

const TRANSITION_TIME = 0.5;
const MIN_Y = 0.5;
const FOLLOW_BACK = 4;
const FOLLOW_UP = 1.5;
const FOLLOW_RATE = 6;

const smoothstep = (t) => t * t * (3 - 2 * t);

export function createCameraRig(camera, controls) {
  let serverPos = { x: -8, y: 1, z: 0 };
  const views = {
    broadcast: () => ({ pos: new THREE.Vector3(-17, 8, 0), look: new THREE.Vector3(2, 1, 0) }),
    side: () => ({ pos: new THREE.Vector3(0, 4, 15), look: new THREE.Vector3(0, 1.5, 0) }),
    server: () => ({
      pos: new THREE.Vector3(serverPos.x - 1.5, serverPos.y + 0.3, serverPos.z),
      look: new THREE.Vector3(6, 1, serverPos.z),
    }),
  };

  let view = 'broadcast';
  const look = controls.target.clone();
  let transitioning = false;
  let elapsed = 0;
  let fromPos = null;
  let fromLook = null;

  function setView(name) {
    view = name;
    controls.enabled = name === 'free';
    transitioning = name in views;
    if (transitioning) {
      elapsed = 0;
      fromPos = camera.position.clone();
      fromLook = look.clone();
    }
  }

  function setServerPos(pos) {
    serverPos = pos;
  }

  function followPoint(ballPos, ballVel) {
    const horiz = ballVel && Math.hypot(ballVel.x, ballVel.z) > 1e-9 ? ballVel : { x: 1, z: 0 };
    const len = Math.hypot(horiz.x, horiz.z);
    return new THREE.Vector3(
      ballPos.x - (horiz.x / len) * FOLLOW_BACK,
      ballPos.y + FOLLOW_UP,
      ballPos.z - (horiz.z / len) * FOLLOW_BACK,
    );
  }

  function update(dt, ballPos, ballVel) {
    const k = 1 - Math.exp(-FOLLOW_RATE * dt);
    if (view === 'free') {
      look.copy(controls.target);
    } else if (view === 'follow') {
      if (ballPos) {
        camera.position.lerp(followPoint(ballPos, ballVel), k);
        look.copy(ballPos);
      } else {
        const b = views.broadcast();
        camera.position.lerp(b.pos, k);
        look.lerp(b.look, k);
      }
    } else if (transitioning) {
      elapsed += dt;
      const dest = views[view]();
      const p = smoothstep(Math.min(elapsed / TRANSITION_TIME, 1));
      camera.position.lerpVectors(fromPos, dest.pos, p);
      look.lerpVectors(fromLook, dest.look, p);
      if (elapsed >= TRANSITION_TIME) transitioning = false;
    } else {
      const dest = views[view]();
      camera.position.copy(dest.pos);
      look.copy(dest.look);
    }
    if (camera.position.y < MIN_Y) camera.position.y = MIN_Y;
    if (view !== 'free') {
      controls.target.copy(look);
      camera.lookAt(look);
    }
  }

  return { names: ['broadcast', 'side', 'server', 'follow', 'free'], setView, setServerPos, update };
}
