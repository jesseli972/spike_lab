import { test, expect } from 'vitest';
import { checkNetCrossing, checkFloor, isInCourt } from '../src/physics/collide.js';
import { BALL_RADIUS, NET_HEIGHT_MEN, LINE_TOUCH_TOL } from '../src/constants.js';

const N = NET_HEIGHT_MEN;

// A level segment from x = -1 to x = +1 at the given y and z.
function crossAt(y, z = 0) {
  return checkNetCrossing({ x: -1, y, z }, { x: 1, y, z }, N);
}

test('ball well above the net is clear with positive clearance', () => {
  const r = crossAt(N + 0.5);
  expect(r.type).toBe('clear');
  expect(r.clearance).toBeCloseTo(0.5 - BALL_RADIUS);
});

test('ball below the net top is a net hit', () => {
  expect(crossAt(N - 0.1).type).toBe('net');
});

test('ball passing under the net is a net hit', () => {
  expect(crossAt(0.3).type).toBe('net');
});

test('ball at the antenna edge over the tape is an antenna hit', () => {
  const r = crossAt(N, 4.5);
  expect(r.type).toBe('antenna');
  expect(r.clearance).toBeNull();
});

test('ball past the court side line above the antenna band is outside', () => {
  const r = crossAt(N + 1, 4.8);
  expect(r.type).toBe('outside');
  expect(r.clearance).toBeNull();
});

test('ball exactly BALL_RADIUS above the tape is clear with clearance 0', () => {
  const r = crossAt(N + BALL_RADIUS);
  expect(r.type).toBe('clear');
  expect(r.clearance).toBeCloseTo(0);
});

test('net crossing point is interpolated to x = 0', () => {
  const r = checkNetCrossing({ x: -2, y: 3, z: 0 }, { x: 2, y: 1, z: 1 }, N);
  expect(r.point.x).toBe(0);
  expect(r.point.y).toBeCloseTo(2);
  expect(r.point.z).toBeCloseTo(0.5);
});

test('floor hit halfway between two samples returns the midpoint', () => {
  const r = checkFloor(
    { x: 0, y: BALL_RADIUS + 0.2, z: 0 },
    { x: 2, y: BALL_RADIUS - 0.2, z: 4 },
  );
  expect(r.point.x).toBeCloseTo(1);
  expect(r.point.y).toBeCloseTo(BALL_RADIUS);
  expect(r.point.z).toBeCloseTo(2);
});

test('no floor hit while the ball is above BALL_RADIUS', () => {
  expect(checkFloor({ x: 0, y: 1, z: 0 }, { x: 1, y: BALL_RADIUS + 0.01, z: 0 })).toBeNull();
});

test('a point on the court line is in, 0.1 m past it is out', () => {
  expect(isInCourt({ x: 9, y: 0, z: 4.5 })).toBe(true);
  expect(isInCourt({ x: 9.1, y: 0, z: 0 })).toBe(false);
  expect(isInCourt({ x: 0, y: 0, z: 4.6 })).toBe(false);
  expect(isInCourt({ x: -9 - LINE_TOUCH_TOL, y: 0, z: 0 })).toBe(true);
});
