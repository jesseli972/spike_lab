import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { PHYSICS_DT } from '../constants.js';

// Replaces LineMaterial's vertex-colour step. The colour attribute is used as data, not colour:
// r = how far along the path (0 to 1), g = speed relative to the fastest sample.
// The trail fades behind the ball, brightens where the ball was fast, and glows white at the head.
const TRAIL_FRAGMENT = /* glsl */ `
  float age = max(uHead - vColor.r, 0.0);
  float fade = mix(0.3, 1.0, exp(-age * 5.0));
  float glow = exp(-age * 45.0);
  diffuseColor.rgb = diffuse * fade * (0.55 + 0.75 * vColor.g) + vec3(glow);
  alpha *= mix(0.45, 1.0, fade);
`;

export function createTrail(color) {
  const head = { value: 0 };
  // LineMaterial needs the drawing-buffer size to turn pixel widths into geometry.
  // shortcut: resolution is set once from the window, so a resize leaves the width off, add a resize hook when it matters
  const material = new LineMaterial({
    color,
    linewidth: 4,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    resolution: new THREE.Vector2(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio),
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHead = head;
    shader.fragmentShader = 'uniform float uHead;\n'
      + shader.fragmentShader.replace('#include <color_fragment>', TRAIL_FRAGMENT);
  };
  const line = new Line2(new LineGeometry(), material);
  line.visible = false;
  let count = 0;

  return {
    object3d: line,
    setPath(samples) {
      line.geometry.dispose();
      const flat = [];
      const data = [];
      let fastest = 0;
      for (const s of samples) fastest = Math.max(fastest, Math.hypot(s.vel.x, s.vel.y, s.vel.z));
      samples.forEach((s, i) => {
        flat.push(s.pos.x, s.pos.y, s.pos.z);
        const speed = Math.hypot(s.vel.x, s.vel.y, s.vel.z);
        data.push(i / Math.max(samples.length - 1, 1), fastest > 0 ? speed / fastest : 0, 0);
      });
      line.geometry = new LineGeometry();
      line.geometry.setPositions(flat);
      line.geometry.setColors(data);
      count = samples.length;
      line.visible = true;
    },
    reveal(t) {
      const shown = Math.min(Math.max(Math.floor(t / PHYSICS_DT), 0), Math.max(count - 1, 0));
      line.geometry.instanceCount = shown;
      head.value = shown / Math.max(count - 1, 1);
    },
    clear() {
      line.visible = false;
    },
  };
}
