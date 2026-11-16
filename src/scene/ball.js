import * as THREE from 'three';

export function createBall() {
  return { mesh: new THREE.Group(), setState(pos, quaternion) {}, setVisible(visible) {} };
}
