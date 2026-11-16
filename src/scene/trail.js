import * as THREE from 'three';

export function createTrail(color) {
  return { object3d: new THREE.Group(), setPath(samples) {}, reveal(t) {}, clear() {} };
}
