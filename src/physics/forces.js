import {
  AIR_DENSITY,
  BALL_MASS,
  BALL_RADIUS,
  GRAVITY,
} from '../constants.js';

const K = (0.5 * AIR_DENSITY * Math.PI * BALL_RADIUS * BALL_RADIUS) / BALL_MASS;

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function length(v) {
  return Math.hypot(v.x, v.y, v.z);
}

export function liftCoeff(spinFactor) {
  if (spinFactor <= 0) return 0;
  return spinFactor / (2.32 * spinFactor + 0.4);
}

export function acceleration(vel, omega, dragCoeff) {
  const speed = length(vel);
  const acc = { x: 0, y: -GRAVITY, z: 0 };

  const drag = -K * dragCoeff * speed;
  acc.x += drag * vel.x;
  acc.y += drag * vel.y;
  acc.z += drag * vel.z;

  const spinRate = length(omega);
  if (spinRate > 0 && speed > 1e-6) {
    const S = (BALL_RADIUS * spinRate) / speed;
    const c = cross(omega, vel);
    const cLen = length(c);
    if (cLen > 1e-12) {
      const lift = K * liftCoeff(S) * speed * speed / cLen;
      acc.x += lift * c.x;
      acc.y += lift * c.y;
      acc.z += lift * c.z;
    }
  }
  return acc;
}
