import {
  COURT_LENGTH,
  COURT_WIDTH,
  BALL_RADIUS,
  NET_BAND,
  ANTENNA_ABOVE_NET,
  LINE_TOUCH_TOL,
} from '../constants.js';

const HALF_LENGTH = COURT_LENGTH / 2;
const HALF_WIDTH = COURT_WIDTH / 2;

// Linear interpolation between two Vec points at fraction t.
function lerpVec(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

export function checkNetCrossing(prev, curr, netHeight) {
  const t = -prev.x / (curr.x - prev.x);
  const point = lerpVec(prev, curr, t);
  point.x = 0;
  const absZ = Math.abs(point.z);
  const y = point.y;

  if (
    Math.abs(absZ - HALF_WIDTH) <= BALL_RADIUS + 0.01 &&
    y >= netHeight - NET_BAND &&
    y <= netHeight + ANTENNA_ABOVE_NET
  ) {
    return { type: 'antenna', point, clearance: null };
  }
  if (absZ > HALF_WIDTH) {
    return { type: 'outside', point, clearance: null };
  }
  if (y < netHeight + BALL_RADIUS) {
    return { type: 'net', point, clearance: null };
  }
  return { type: 'clear', point, clearance: y - BALL_RADIUS - netHeight };
}

export function checkFloor(prev, curr) {
  if (curr.y > BALL_RADIUS) return null;
  const t = (prev.y - BALL_RADIUS) / (prev.y - curr.y);
  return { point: lerpVec(prev, curr, t) };
}

export function isInCourt(point) {
  return (
    Math.abs(point.x) <= HALF_LENGTH + LINE_TOUCH_TOL &&
    Math.abs(point.z) <= HALF_WIDTH + LINE_TOUCH_TOL
  );
}
