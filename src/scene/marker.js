import * as THREE from 'three';

export function createMarker() {
  return { object3d: new THREE.Group(), show(landing, outcome) {}, hide() {} };
}
