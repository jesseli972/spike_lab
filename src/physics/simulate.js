import {
  BALL_RADIUS,
  DRAG_COEFF,
  MAX_FLIGHT_TIME,
  PHYSICS_DT,
} from '../constants.js';
import { launchToState } from './launch.js';
import { rk4Step } from './integrator.js';
import { checkNetCrossing, checkFloor, isInCourt } from './collide.js';

function lerpVec(a, b, f) {
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    z: a.z + (b.z - a.z) * f,
  };
}

// Final sample at a point inside the step from `state` to `next`, fraction f.
function endSample(state, next, f, point) {
  return {
    t: state.t + PHYSICS_DT * f,
    pos: point,
    vel: lerpVec(state.vel, next.vel, f),
  };
}

export function simulate(launch) {
  const start = launchToState(launch);
  const omega = start.omega;
  const samples = [{ t: 0, pos: start.pos, vel: start.vel }];
  let state = { t: 0, pos: start.pos, vel: start.vel };
  let crossed = false;
  let outside = false;
  let netClearance = null;
  let outcome = 'out';
  let landing = null;

  while (state.t < MAX_FLIGHT_TIME) {
    const next = rk4Step(state, omega, PHYSICS_DT, DRAG_COEFF);
    let done = false;

    if (state.pos.x < 0 && next.pos.x >= 0) {
      const c = checkNetCrossing(state.pos, next.pos, launch.netHeight);
      if (c.type === 'net' || c.type === 'antenna') {
        const f = -state.pos.x / (next.pos.x - state.pos.x);
        samples.push(endSample(state, next, f, c.point));
        outcome = c.type;
        done = true;
      } else if (c.type === 'outside') {
        outside = true;
        crossed = true;
      } else {
        netClearance = c.clearance;
        crossed = true;
      }
    }

    if (!done) {
      const floor = checkFloor(state.pos, next.pos);
      if (floor) {
        const f = (state.pos.y - BALL_RADIUS) / (state.pos.y - next.pos.y);
        samples.push(endSample(state, next, f, floor.point));
        landing = { x: floor.point.x, z: floor.point.z };
        outcome =
          crossed && !outside && landing.x > 0 && isInCourt(floor.point)
            ? 'in'
            : 'out';
        done = true;
      }
    }

    if (done) break;

    state = { t: state.t + PHYSICS_DT, pos: next.pos, vel: next.vel };
    samples.push({ t: state.t, pos: state.pos, vel: state.vel });
  }

  let peakHeight = 0;
  for (const s of samples) peakHeight = Math.max(peakHeight, s.pos.y);

  return {
    samples,
    omega,
    outcome,
    landing,
    flightTime: samples[samples.length - 1].t,
    peakHeight,
    netClearance,
  };
}
