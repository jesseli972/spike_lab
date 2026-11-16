export function rk4Step(state, omega, dt, dragCoeff) {
  return { pos: { ...state.pos }, vel: { ...state.vel } };
}
