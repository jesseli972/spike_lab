import * as THREE from 'three';

const GREEN = 0x2ecc71;
const RED = 0xe74c3c;
const RING_INNER = 0.12;
const RING_OUTER = 0.2;
const QUAD_SIZE = 1.6; // room around the ring for the pulse to travel

// Landing ring shader: a solid ring plus a wave that keeps expanding and fading from it.
const VERTEX = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uReach;
  varying vec2 vPos;
  void main() {
    float r = length(vPos);
    float aa = fwidth(r);
    float ring = smoothstep(uInner - aa, uInner + aa, r) * (1.0 - smoothstep(uOuter - aa, uOuter + aa, r));
    float phase = fract(uTime * 0.7);
    float waveR = mix(uOuter, uReach, phase);
    float wave = (1.0 - phase) * (1.0 - smoothstep(0.0, 0.04, abs(r - waveR)));
    float glow = 0.35 * exp(-r * r * 14.0);
    float alpha = max(ring, max(wave * 0.8, glow));
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor * (1.0 + ring * 0.6), alpha);
    #include <colorspace_fragment>
  }
`;

export function createMarker() {
  const uniforms = {
    uColor: { value: new THREE.Color(RED) },
    uTime: { value: 0 },
    uInner: { value: RING_INNER },
    uOuter: { value: RING_OUTER },
    uReach: { value: QUAD_SIZE / 2 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT,
    transparent: true, depthWrite: false, toneMapped: false,
    // The court surface and lines use polygonOffset; without a stronger one here they cover the ring.
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  });
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(QUAD_SIZE, QUAD_SIZE), material);
  ring.rotation.x = -Math.PI / 2; // lie flat on the floor
  ring.position.y = 0.003;
  ring.visible = false;
  ring.onBeforeRender = () => { uniforms.uTime.value = performance.now() / 1000; };

  return {
    object3d: ring,
    show(landing, outcome) {
      if (!landing) {
        ring.visible = false;
        return;
      }
      ring.position.x = landing.x;
      ring.position.z = landing.z;
      uniforms.uColor.value.set(outcome === 'in' ? GREEN : RED);
      ring.visible = true;
    },
    hide() {
      ring.visible = false;
    },
  };
}
