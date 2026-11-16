import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { PHYSICS_DT } from '../constants.js';

export function createTrail(color) {
  // LineMaterial needs the drawing-buffer size to turn pixel widths into geometry.
  // shortcut: resolution is set once from the window, so a resize leaves the width off, add a resize hook when it matters
  const material = new LineMaterial({
    color,
    linewidth: 4,
    resolution: new THREE.Vector2(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio),
  });
  const line = new Line2(new LineGeometry(), material);
  line.visible = false;
  let count = 0;

  return {
    object3d: line,
    setPath(samples) {
      line.geometry.dispose();
      const flat = [];
      for (const s of samples) flat.push(s.pos.x, s.pos.y, s.pos.z);
      line.geometry = new LineGeometry();
      line.geometry.setPositions(flat);
      count = samples.length;
      line.visible = true;
    },
    reveal(t) {
      const shown = Math.floor(t / PHYSICS_DT);
      line.geometry.instanceCount = Math.min(Math.max(shown, 0), Math.max(count - 1, 0));
    },
    clear() {
      line.visible = false;
    },
  };
}
