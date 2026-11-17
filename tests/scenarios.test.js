import { test, expect } from 'vitest';
import { simulate } from '../src/physics/simulate.js';
import { PRESETS } from '../src/ui/presets.js';

const MIN_SPIN_SHIFT = 1; // metres
const SPEED_UP = 1.1;
const MIN_CLEARANCE = 0.05; // metres
const MAX_CLEARANCE = 1.0; // metres

const [float, topspinServe] = PRESETS.map((p) => p.launch);

function withSpin(launch, spinType, spinRpm) {
  return { ...launch, spinType, spinRpm };
}

test('topspin lands at least 1 m shorter than no spin', () => {
  const none = simulate(withSpin(topspinServe, 'none', 0));
  const top = simulate(withSpin(topspinServe, 'top', topspinServe.spinRpm));
  expect(none.landing.x - top.landing.x).toBeGreaterThanOrEqual(MIN_SPIN_SHIFT);
});

test('backspin lands farther than no spin', () => {
  const none = simulate(withSpin(topspinServe, 'none', 0));
  const back = simulate(withSpin(topspinServe, 'back', topspinServe.spinRpm));
  expect(back.landing.x).toBeGreaterThan(none.landing.x);
});

test('raising speed by 10% on an in serve makes it land farther', () => {
  const base = simulate(float);
  const faster = simulate({ ...float, speed: float.speed * SPEED_UP });
  expect(base.outcome).toBe('in');
  expect(faster.landing.x).toBeGreaterThan(base.landing.x);
});

test.each(PRESETS.map((p) => [p.name, p.launch]))(
  '%s ends in with net clearance between the bounds',
  (_name, launch) => {
    const r = simulate(launch);
    expect(r.outcome).toBe('in');
    expect(r.netClearance).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    expect(r.netClearance).toBeLessThanOrEqual(MAX_CLEARANCE);
  },
);
