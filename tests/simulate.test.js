import { test, expect } from 'vitest';
import { simulate } from '../src/physics/simulate.js';
import { BALL_RADIUS, NET_HEIGHT_MEN } from '../src/constants.js';

function launch(pos, speed, azimuthDeg, elevationDeg) {
  return {
    pos,
    speed,
    azimuthDeg,
    elevationDeg,
    spinType: 'none',
    spinRpm: 0,
    netHeight: NET_HEIGHT_MEN,
  };
}

test.each([
  ['in', launch({ x: -1.5, y: 3.2, z: 0 }, 22, 0, -17)],
  ['net', launch({ x: -2, y: 2.0, z: 0 }, 20, 0, 0)],
  ['out', launch({ x: -9.5, y: 2.6, z: 0 }, 30, 0, 10)],
  ['out', launch({ x: -1.5, y: 3.2, z: 2.0 }, 22, 30, -17)],
  ['out', launch({ x: -1.5, y: 3.2, z: 4.0 }, 22, 45, -17)],
])('launch gives outcome %s', (expected, l) => {
  expect(simulate(l).outcome).toBe(expected);
});

test('same launch twice gives deeply equal results', () => {
  const l = launch({ x: -1.5, y: 3.2, z: 0 }, 22, 0, -17);
  expect(simulate(l)).toEqual(simulate(l));
});

test('flight ending on the floor finishes at ball radius height', () => {
  const r = simulate(launch({ x: -1.5, y: 3.2, z: 0 }, 22, 0, -17));
  const last = r.samples[r.samples.length - 1];
  expect(last.pos.y).toBeCloseTo(BALL_RADIUS);
});

test('netClearance is a number for a clear pass and null for a net hit', () => {
  const clear = simulate(launch({ x: -1.5, y: 3.2, z: 0 }, 22, 0, -17));
  const hit = simulate(launch({ x: -2, y: 2.0, z: 0 }, 20, 0, 0));
  expect(typeof clear.netClearance).toBe('number');
  expect(hit.netClearance).toBeNull();
});
