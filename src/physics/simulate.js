export function simulate(launch) {
  return {
    samples: [],
    omega: { x: 0, y: 0, z: 0 },
    outcome: 'out',
    landing: null,
    flightTime: 0,
    peakHeight: 0,
    netClearance: null,
  };
}
