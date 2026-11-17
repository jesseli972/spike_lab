# Spike Lab

A browser app that shows a 3D volleyball court. Set how a ball is hit (contact position, speed, angles, spin), press Launch, and watch it fly. The app draws the flight path, marks where the ball lands, and calls it in, out, or net.

Built with Vite, plain JavaScript ES modules, three.js, lil-gui, and Vitest.

## Run, test, build

```sh
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run build    # production build into dist/ (relative asset paths)
npm run preview  # serve the built dist/ locally
```

## Controls

- **Space**: launch with the current settings (unless focus is in a field or button).
- **Panel** (top right): a preset menu, contact position, speed, aim, vertical angle, spin type and rpm, net height (men or women), camera view, and a Launch button.
- **Readout** (top left): the call (IN, OUT, NET or ANTENNA), landing point, flight time, peak height, and net clearance.
- **Replay**: set a playback speed, pause, or drag Scrub to any moment of the flight. Dragging Scrub back to 0 replays it.
- **Compare**: turn on "Compare with last" to keep the previous path as a dim trail and see how much farther or shorter the new flight landed.
- **Views**: broadcast, side, server, follow, and free.
- **Free view**: drag to orbit the camera.

## Graphics

- A gym hall, a procedural wood-plank floor, environment reflections, and filmic tone mapping.
- Hand-written GLSL shaders: a net that ripples where the ball hits it, a trail that fades behind the ball and glows at its head, and a pulsing landing ring.
- Every texture is drawn in code on a canvas; the project has no image or model files.

## Units

Code uses meters, seconds, kilograms, and radians. The UI shows km/h, degrees, and rpm.

## Known simplifications

- A touch of the net ends the flight.
- Spin stays constant for the whole flight.
- The drag coefficient is constant (it does not depend on speed or air conditions).
