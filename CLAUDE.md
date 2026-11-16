# Spike Lab: shared context

Every agent working in this repo follows this file. Your task card is in `tasks/`. Read all of this file before your task card.

## What we are building

A browser app that shows a 3D volleyball court. The user sets how a ball is hit (position, speed, angles, spin), presses Launch, and watches it fly. The app draws a trail, marks where the ball lands, and calls it in, out, or net.

## Stack

- Vite + plain JavaScript ES modules. No TypeScript, no framework.
- three (npm). Import as: `import * as THREE from 'three'`. Add-ons come from `'three/addons/...'`.
- lil-gui for controls. Vitest for tests.
- Do not add any other dependency.

## Units and coordinates

- 1 unit = 1 meter. Code uses meters, seconds, kilograms, radians. Only the UI shows km/h, degrees, and rpm.
- Y is up. The floor is y = 0.
- Origin = center of the court, on the floor.
- X runs along the court's length. The net stands in the plane x = 0.
- Z runs across the court's width.
- Court surface: x from -9 to 9, z from -4.5 to 4.5. Boundary lines lie inside these bounds.
- The hitter is on the x < 0 side. The ball travels toward +x and should land where x > 0.

## Constants

These live in `src/constants.js`. Import them; never retype a number.

```text
COURT_LENGTH = 18          COURT_WIDTH = 9
LINE_WIDTH = 0.05          ATTACK_LINE_DIST = 3
NET_HEIGHT_MEN = 2.43      NET_HEIGHT_WOMEN = 2.24   (top edge of net)
NET_BAND = 1.0             (the net mesh is 1 m tall)
NET_LENGTH = 9.5           ANTENNA_ABOVE_NET = 0.8
POST_OFFSET = 1.0          POST_HEIGHT = 2.55
BALL_RADIUS = 0.105        BALL_MASS = 0.27
GRAVITY = 9.81             AIR_DENSITY = 1.2
DRAG_COEFF = 0.2
PHYSICS_DT = 1 / 240       MAX_FLIGHT_TIME = 6
LINE_TOUCH_TOL = 0.03
```

## Data shapes (plain objects)

```text
Vec     { x, y, z }
Launch  { pos: Vec, speed, azimuthDeg, elevationDeg,
          spinType: 'none' | 'top' | 'back', spinRpm, netHeight }
          speed is in m/s.
Sample  { t, pos: Vec, vel: Vec }
Result  { samples: Sample[], omega: Vec,
          outcome: 'in' | 'out' | 'net' | 'antenna',
          landing: { x, z } or null,
          flightTime, peakHeight,
          netClearance: number or null }
```

## Launch angles

```text
azimuthDeg:   0 = straight down the court (+x). Positive turns toward +z.
elevationDeg: 0 = level. Positive = upward.
velocity = speed * ( cos(el)*cos(az), sin(el), cos(el)*sin(az) )
Spin axis (unit vector):
  top  = ( sin(az), 0, -cos(az) )
  back = the negative of top
  none = ( 0, 0, 0 )
omega = axis * spinRpm * 2 * PI / 60     (radians per second)
```

## Module contracts

```text
src/scene/court.js
  createCourt(netHeight) -> THREE.Group
src/scene/ball.js
  createBall() -> { mesh, setState(pos, quaternion), setVisible(bool) }
src/scene/lights.js
  addLights(scene, renderer) -> nothing
src/scene/trail.js
  createTrail(color) -> { object3d, setPath(samples), reveal(t), clear() }
src/scene/marker.js
  createMarker() -> { object3d, show(landing, outcome), hide() }
src/physics/launch.js
  launchToState(launch) -> { pos: Vec, vel: Vec, omega: Vec }
src/physics/forces.js
  acceleration(vel, omega, dragCoeff) -> Vec
  liftCoeff(spinFactor) -> number
src/physics/integrator.js
  rk4Step(state, omega, dt, dragCoeff) -> { pos: Vec, vel: Vec }
src/physics/collide.js
  checkNetCrossing(prev, curr, netHeight)
    -> { type: 'clear' | 'net' | 'antenna' | 'outside', point: Vec, clearance }
  checkFloor(prev, curr) -> null or { point: Vec }
  isInCourt(point) -> boolean
src/physics/simulate.js
  simulate(launch) -> Result
src/cameras/rig.js
  createCameraRig(camera, controls)
    -> { names, setView(name), setServerPos(pos), update(dt, ballPos, ballVel) }
src/ui/panel.js
  createPanel({ viewNames, onLaunch, onViewChange, onNetHeightChange })
    -> { getLaunch(), setLaunch(launch) }
src/ui/readout.js
  createReadout() -> { show(result), clear() }
src/ui/presets.js
  PRESETS: array of { name, launch }
src/main.js
  Builds the scene and runs the loop. Only T01, T11, T15, T16 edit it.
```

## Rules

1. Edit only the files listed on your task card. If another file needs a change, stop and report it. Do not edit it.
2. Never change a name, parameter, or return shape in the module contracts.
3. Code under `src/physics` must not import three. It uses plain `{ x, y, z }` objects so the tests run in Node.
4. No image or model files. Make textures in code with a canvas (`THREE.CanvasTexture`).
5. Never retype a number that exists in `constants.js`.
6. Write small plain functions. Add nothing the card does not ask for.
7. Before you report, run `npm test`, then `npm run build`. Both must pass.
8. If a step is unclear or looks wrong, stop and ask. Do not guess.
9. Never edit `CLAUDE.md` or anything in `tasks/`.

## Report format

Reply with exactly these four headings:

```text
FILES CHANGED:
DONE-WHEN CHECKS: each check from the card, pass or fail, and how you checked
DEVIATIONS: anything you did differently from the card, and why
QUESTIONS: anything unclear, or any contract you think is wrong
```
