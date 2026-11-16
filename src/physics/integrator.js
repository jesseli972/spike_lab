import { acceleration } from './forces.js';

function add(a, b, s) {
  return { x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s };
}

export function rk4Step(state, omega, dt, dragCoeff) {
  const k1v = acceleration(state.vel, omega, dragCoeff);
  const k1p = state.vel;

  const v2 = add(state.vel, k1v, dt / 2);
  const k2v = acceleration(v2, omega, dragCoeff);
  const k2p = v2;

  const v3 = add(state.vel, k2v, dt / 2);
  const k3v = acceleration(v3, omega, dragCoeff);
  const k3p = v3;

  const v4 = add(state.vel, k3v, dt);
  const k4v = acceleration(v4, omega, dragCoeff);
  const k4p = v4;

  const pos = {
    x: state.pos.x + (dt / 6) * (k1p.x + 2 * k2p.x + 2 * k3p.x + k4p.x),
    y: state.pos.y + (dt / 6) * (k1p.y + 2 * k2p.y + 2 * k3p.y + k4p.y),
    z: state.pos.z + (dt / 6) * (k1p.z + 2 * k2p.z + 2 * k3p.z + k4p.z),
  };
  const vel = {
    x: state.vel.x + (dt / 6) * (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x),
    y: state.vel.y + (dt / 6) * (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y),
    z: state.vel.z + (dt / 6) * (k1v.z + 2 * k2v.z + 2 * k3v.z + k4v.z),
  };
  return { pos, vel };
}
