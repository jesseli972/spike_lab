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

// Wood planks running along the court's length, each with its own tone and a little grain.
function woodTexture() {
  const texture = canvasTexture(1024, 1024, (ctx, w, h) => {
    const plankH = h / 32;
    for (let row = 0; row < 32; row++) {
      let x = -((row * 197) % 256);
      while (x < w) {
        const len = 200 + ((row * 73 + x * 31) % 180);
        const tone = 0.86 + (((row * 53 + x * 17) % 100) / 100) * 0.22;
        ctx.fillStyle = `rgb(${Math.round(198 * tone)}, ${Math.round(150 * tone)}, ${Math.round(92 * tone)})`;
        ctx.fillRect(x, row * plankH, len, plankH);
        ctx.fillStyle = 'rgba(60, 35, 15, 0.35)';
        ctx.fillRect(x, row * plankH, 2, plankH);
        x += len;
      }
      ctx.fillStyle = 'rgba(60, 35, 15, 0.3)';
      ctx.fillRect(0, row * plankH, w, 1.5);
    }
    ctx.strokeStyle = 'rgba(90, 55, 25, 0.06)';
    for (let i = 0; i < 500; i++) {
      const y = (i * 131) % h;
      const x = (i * 389) % w;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y + ((i % 3) - 1)); ctx.stroke();
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7.5, 5); // one tile covers 4 m x 4 m of the 30 x 20 floor
  texture.anisotropy = 8;
  return texture;
}

// Net shader. The mesh is drawn in the fragment shader (10 cm cells, white tapes on the edges);
// the vertex shader sways it gently and sends a decaying ripple out from where a ball hits.
const NET_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uHitTime;
  uniform vec2 uHit;
  uniform vec2 uSize;
  varying vec2 vMeters;
  void main() {
    vMeters = position.xy + uSize * 0.5;
    vec3 p = position;
    // The top tape hangs from the cable and the ends are tied off, so they move least.
    float slack = smoothstep(0.0, 0.8, uSize.x * 0.5 - abs(p.x)) * smoothstep(0.0, 0.5, uSize.y * 0.5 - p.y);
    float sway = sin(uTime * 1.3 + p.x * 1.7) * 0.006;
    float age = uTime - uHitTime;
    float d = distance(p.xy, uHit);
    float ripple = sin(d * 14.0 - age * 20.0) * exp(-d * 1.4) * exp(-age * 2.2) * 0.10;
    float bulge = exp(-d * d * 3.0) * exp(-age * 4.0) * 0.22;
    p.z += slack * (sway + step(0.0, age) * (ripple + bulge));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const NET_FRAGMENT = /* glsl */ `
  uniform vec2 uSize;
  varying vec2 vMeters;
  void main() {
    vec2 cell = vMeters / 0.1;
    vec2 dist = abs(fract(cell - 0.5) - 0.5) / fwidth(cell);
    float cord = 1.0 - clamp(min(dist.x, dist.y) - 0.6, 0.0, 1.0);
    float tape = max(step(uSize.y - 0.07, vMeters.y), step(vMeters.y, 0.05));
    tape = max(tape, max(step(vMeters.x, 0.05), step(uSize.x - 0.05, vMeters.x)));
    vec3 color = mix(vec3(0.03), vec3(0.95), tape);
    float alpha = max(tape, cord * 0.9);
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

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
  const floorMat = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.35 });
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0x1f6f8b, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
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
  const netUniforms = {
    uTime: { value: 0 },
    uHitTime: { value: -100 },
    uHit: { value: new THREE.Vector2() },
    uSize: { value: new THREE.Vector2(NET_LENGTH, NET_BAND) },
  };
  const netMat = new THREE.ShaderMaterial({
    uniforms: netUniforms, vertexShader: NET_VERTEX, fragmentShader: NET_FRAGMENT,
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
  });
  // Subdivided so the ripple has vertices to move. It casts no shadow: a depth pass would
  // ignore the shader's holes and draw a solid slab.
  const net = new THREE.Mesh(new THREE.PlaneGeometry(NET_LENGTH, NET_BAND, 96, 12), netMat);
  net.rotation.y = Math.PI / 2;
  net.position.set(0, netHeight - NET_BAND / 2, 0);
  net.name = 'net';
  net.onBeforeRender = () => { netUniforms.uTime.value = performance.now() / 1000; };
  group.add(net);
  // main.js calls this with the world-space contact point when a flight ends in the net.
  group.userData.hitNet = (point) => {
    net.updateWorldMatrix(true, false);
    const local = net.worldToLocal(new THREE.Vector3(point.x, point.y, point.z));
    netUniforms.uHit.value.set(local.x, local.y);
    netUniforms.uHitTime.value = performance.now() / 1000;
  };

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
