import * as THREE from 'three';

export function addLights(scene, renderer) {
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.background = new THREE.Color(0x2b2f36);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-6, 14, 8);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);

  const cam = sun.shadow.camera;
  cam.left = -11;
  cam.right = 11;
  cam.top = 7;
  cam.bottom = -7;
  cam.near = 1;
  cam.far = 40;
  cam.updateProjectionMatrix();

  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;

  scene.add(sun);
  scene.add(sun.target);
}
