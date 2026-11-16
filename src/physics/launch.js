const DEG = Math.PI / 180;

function spinAxis(azimuthDeg, spinType) {
  const az = azimuthDeg * DEG;
  if (spinType === 'top') return { x: Math.sin(az), y: 0, z: -Math.cos(az) };
  if (spinType === 'back') return { x: -Math.sin(az), y: 0, z: Math.cos(az) };
  return { x: 0, y: 0, z: 0 };
}

export function launchToState(launch) {
  const az = launch.azimuthDeg * DEG;
  const el = launch.elevationDeg * DEG;
  const s = launch.speed;
  const axis = spinAxis(launch.azimuthDeg, launch.spinType);
  const w = launch.spinRpm * 2 * Math.PI / 60;
  return {
    pos: { x: launch.pos.x, y: launch.pos.y, z: launch.pos.z },
    vel: {
      x: s * Math.cos(el) * Math.cos(az),
      y: s * Math.sin(el),
      z: s * Math.cos(el) * Math.sin(az),
    },
    omega: { x: axis.x * w, y: axis.y * w, z: axis.z * w },
  };
}
