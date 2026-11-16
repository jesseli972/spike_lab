export function checkNetCrossing(prev, curr, netHeight) {
  return { type: 'outside', point: { x: 0, y: 0, z: 0 }, clearance: null };
}

export function checkFloor(prev, curr) {
  return null;
}

export function isInCourt(point) {
  return false;
}
