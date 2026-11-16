import * as THREE from 'three';

const GREEN = 0x2ecc71;
const RED = 0xe74c3c;

export function createMarker() {
  const geometry = new THREE.RingGeometry(0.12, 0.2, 48);
  geometry.rotateX(-Math.PI / 2); // lay the ring flat on the floor
  const materials = { in: new THREE.MeshBasicMaterial({ color: GREEN }), out: new THREE.MeshBasicMaterial({ color: RED }) };
  const ring = new THREE.Mesh(geometry, materials.out);
  ring.position.y = 0.003;
  ring.visible = false;

  return {
    object3d: ring,
    show(landing, outcome) {
      if (!landing) {
        ring.visible = false;
        return;
      }
      ring.position.x = landing.x;
      ring.position.z = landing.z;
      ring.material = outcome === 'in' ? materials.in : materials.out;
      ring.visible = true;
    },
    hide() {
      ring.visible = false;
    },
  };
}
