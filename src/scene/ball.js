import * as THREE from 'three';
import { BALL_RADIUS } from '../constants.js';

// Original panel design: a cream base with three uneven colored bands, so spin shows.
function makeBallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4f1e8';
  ctx.fillRect(0, 0, 512, 256);
  const bands = [
    { color: '#e4572e', x: 0, w: 120 },
    { color: '#17a2b8', x: 200, w: 70 },
    { color: '#2e4bd1', x: 340, w: 110 },
  ];
  for (const b of bands) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, 0, b.w, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBall() {
  const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: makeBallTexture(),
    roughness: 0.6,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;

  function setState(pos, quaternion) {
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.quaternion.copy(quaternion);
  }

  function setVisible(visible) {
    mesh.visible = visible;
  }

  return { mesh, setState, setVisible };
}
