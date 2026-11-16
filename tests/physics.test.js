import { describe, it, expect } from 'vitest';
import { launchToState } from '../src/physics/launch.js';
import { acceleration } from '../src/physics/forces.js';
import { rk4Step } from '../src/physics/integrator.js';
import { PHYSICS_DT, GRAVITY, NET_HEIGHT_MEN } from '../src/constants.js';

const base = { pos: { x: -8, y: 1, z: 0 }, speed: 20, azimuthDeg: 0, elevationDeg: 0, spinType: 'none', spinRpm: 0, netHeight: NET_HEIGHT_MEN };

describe('launchToState', () => {
  it('gives straight velocity at azimuth and elevation 0', () => {
    const s = launchToState(base);
    expect(s.vel.x).toBeCloseTo(20, 9);
    expect(s.vel.y).toBeCloseTo(0, 9);
    expect(s.vel.z).toBeCloseTo(0, 9);
  });

  it('points topspin along -z and backspin along +z', () => {
    const top = launchToState({ ...base, spinType: 'top', spinRpm: 60 });
    const back = launchToState({ ...base, spinType: 'back', spinRpm: 60 });
    expect(top.omega.z).toBeCloseTo(-2 * Math.PI, 9);
    expect(back.omega.z).toBeCloseTo(2 * Math.PI, 9);
    expect(top.omega.x).toBeCloseTo(0, 9);
  });

  it('does not change its input', () => {
    const copy = JSON.parse(JSON.stringify(base));
    launchToState(base);
    expect(base).toEqual(copy);
  });
});

describe('rk4Step', () => {
  const none = { x: 0, y: 0, z: 0 };

  it('matches projectile motion with no drag and no spin', () => {
    let state = { pos: { x: 0, y: 2, z: 0 }, vel: { x: 10, y: 5, z: 0 } };
    for (let i = 0; i < 240; i++) state = rk4Step(state, none, PHYSICS_DT, 0);
    expect(state.pos.x).toBeCloseTo(10, 6);
    expect(state.pos.y).toBeCloseTo(2.095, 6);
  });

  it('ends short of x = 10 with drag', () => {
    let state = { pos: { x: 0, y: 2, z: 0 }, vel: { x: 10, y: 5, z: 0 } };
    for (let i = 0; i < 240; i++) state = rk4Step(state, none, PHYSICS_DT, 0.2);
    expect(state.pos.x).toBeLessThan(10);
  });

  it('does not change its inputs', () => {
    const state = { pos: { x: 0, y: 2, z: 0 }, vel: { x: 10, y: 5, z: 0 } };
    const copy = JSON.parse(JSON.stringify(state));
    rk4Step(state, { x: 0, y: 0, z: -50 }, PHYSICS_DT, 0.2);
    expect(state).toEqual(copy);
  });
});

describe('acceleration spin', () => {
  it('topspin pushes y acceleration below -g, backspin above', () => {
    const vel = { x: 20, y: 0, z: 0 };
    const top = acceleration(vel, { x: 0, y: 0, z: -100 }, 0);
    const back = acceleration(vel, { x: 0, y: 0, z: 100 }, 0);
    expect(top.y).toBeLessThan(-GRAVITY);
    expect(back.y).toBeGreaterThan(-GRAVITY);
  });

  it('does not change its inputs', () => {
    const vel = { x: 20, y: 0, z: 0 };
    const omega = { x: 0, y: 0, z: -100 };
    acceleration(vel, omega, 0.2);
    expect(vel).toEqual({ x: 20, y: 0, z: 0 });
    expect(omega).toEqual({ x: 0, y: 0, z: -100 });
  });
});
