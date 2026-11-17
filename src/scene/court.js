import * as THREE from 'three';
import {
  COURT_LENGTH, COURT_WIDTH, LINE_WIDTH, ATTACK_LINE_DIST, NET_BAND, NET_LENGTH,
  ANTENNA_ABOVE_NET, POST_OFFSET, POST_HEIGHT,
} from '../constants.js';

const ANTENNA_RADIUS = 0.01;
const POST_RADIUS = 0.05;

// Canvas-drawn texture; flipY is on by default, so canvas top maps to the plane's top edge.
function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function netTexture() {
  return canvasTexture(512, 64, (ctx, w, h) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 8);
  });
}

function stripeTexture() {
  return canvasTexture(8, 32, (ctx) => {
    ctx.fillStyle = '#d7263d';
    ctx.fillRect(0, 0, 8, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 16, 8, 16);
  });
}

// A horizontal plane: w runs along x, d runs along z.
function flatPlane(name, w, d, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.name = name;
  mesh.receiveShadow = true;
  return mesh;
}

export function createCourt(netHeight) {
  const group = new THREE.Group();
  group.name = 'court';

  // polygonOffset keeps the thin surface and lines from z-fighting when the camera is far away.
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a5f66 });
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0x1f6f8b, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  });
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });

  group.add(flatPlane('floor', 30, 20, 0, 0, 0, floorMat));
  group.add(flatPlane('courtSurface', COURT_LENGTH, COURT_WIDTH, 0, 0.001, 0, surfaceMat));

  // Each line's outer edge sits on the court bound; its center is half a line width inside.
  const halfL = COURT_LENGTH / 2 - LINE_WIDTH / 2;
  const halfW = COURT_WIDTH / 2 - LINE_WIDTH / 2;
  const lineY = 0.002;
  const lines = [
    ['sidelineNear', COURT_LENGTH, LINE_WIDTH, 0, lineY, halfW],
    ['sidelineFar', COURT_LENGTH, LINE_WIDTH, 0, lineY, -halfW],
    ['endLineLeft', LINE_WIDTH, COURT_WIDTH, -halfL, lineY, 0],
    ['endLineRight', LINE_WIDTH, COURT_WIDTH, halfL, lineY, 0],
    ['centerLine', LINE_WIDTH, COURT_WIDTH, 0, lineY, 0],
    ['attackLineLeft', LINE_WIDTH, COURT_WIDTH, -(ATTACK_LINE_DIST - LINE_WIDTH / 2), lineY, 0],
    ['attackLineRight', LINE_WIDTH, COURT_WIDTH, ATTACK_LINE_DIST - LINE_WIDTH / 2, lineY, 0],
  ];
  for (const [name, w, d, x, y, z] of lines) {
    group.add(flatPlane(name, w, d, x, y, z, lineMat));
  }

  // Net: a vertical plane in x = 0 with its top edge at netHeight.
  const netMat = new THREE.MeshStandardMaterial({
    map: netTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
  const net = new THREE.Mesh(new THREE.PlaneGeometry(NET_LENGTH, NET_BAND), netMat);
  net.rotation.y = Math.PI / 2;
  net.position.set(0, netHeight - NET_BAND / 2, 0);
  net.name = 'net';
  net.castShadow = true;
  net.receiveShadow = true;
  group.add(net);

  // Posts stand outside the court, beyond the sidelines.
  const postGeo = new THREE.CylinderGeometry(POST_RADIUS, POST_RADIUS, POST_HEIGHT, 16);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6 });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(0, POST_HEIGHT / 2, side * (COURT_WIDTH / 2 + POST_OFFSET));
    post.name = side < 0 ? 'postNegZ' : 'postPosZ';
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);
  }

  // Cables tie the net's top and bottom edges to the posts, closing the gap beyond the net's ends.
  const postZ = COURT_WIDTH / 2 + POST_OFFSET;
  const cableLen = postZ - NET_LENGTH / 2;
  const cableGeo = new THREE.CylinderGeometry(ANTENNA_RADIUS, ANTENNA_RADIUS, cableLen, 8);
  cableGeo.rotateX(Math.PI / 2); // lie along z
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (const side of [-1, 1]) {
    for (const [edge, y] of [['Top', netHeight], ['Bottom', netHeight - NET_BAND]]) {
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(0, y, side * (NET_LENGTH / 2 + cableLen / 2));
      cable.name = `cable${edge}${side < 0 ? 'NegZ' : 'PosZ'}`;
      cable.castShadow = true;
      group.add(cable);
    }
  }

  // Antennas run from the net's bottom edge to ANTENNA_ABOVE_NET above its top edge.
  const antennaH = NET_BAND + ANTENNA_ABOVE_NET;
  const antennaGeo = new THREE.CylinderGeometry(ANTENNA_RADIUS, ANTENNA_RADIUS, antennaH, 8);
  const stripes = stripeTexture();
  stripes.wrapS = stripes.wrapT = THREE.RepeatWrapping;
  stripes.repeat.set(1, Math.round(antennaH / 0.2));
  const antennaMat = new THREE.MeshStandardMaterial({ map: stripes });
  for (const side of [-1, 1]) {
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0, netHeight + (ANTENNA_ABOVE_NET - NET_BAND) / 2, side * (COURT_WIDTH / 2));
    antenna.name = side < 0 ? 'antennaNegZ' : 'antennaPosZ';
    antenna.castShadow = true;
    antenna.receiveShadow = true;
    group.add(antenna);
  }

  return group;
}
