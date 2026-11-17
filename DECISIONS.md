# Decisions log

One line per decision the coordinator made. Decisions the human made are in `COORDINATOR.md`.

## Wave 1 (T02 to T09)

- Commits: workers' `git commit` calls were denied by the permission system; the human said "commit them yourself", so the coordinator committed each worker's files on its `task/TNN-name` branch.
- Worktrees: added `.claude/worktrees/` to `.gitignore`, and removed the eight merged, clean worktrees because Vitest on `main` was also running their copies of the tests (45 reported, 19 real).
- T02: accepted `polygonOffset` on the surface and line materials (not on the card) as a harmless guard against line flicker.
- T02: accepted net centre at `netHeight - NET_BAND / 2`, posts at x = 0, and radii 0.05 and 0.01 typed from the card (they are not in `constants.js`).
- T02: no permanent court test; it would need a canvas stub and the card asks for none.
- T03: accepted `createBall().mesh` being a `THREE.Mesh` instead of the stub's Group; the contract only names the field.
- T04: accepted background colour and `PCFSoftShadowMap` being set inside `addLights`, as the card says.
- T05: sent one fix-up; tests retyped `9.81` and `2.43`, now `GRAVITY` and `NET_HEIGHT_MEN`. No expected value changed.
- T05: accepted `launchToState` returning a copy of `launch.pos`, and zero lift when the cross product is shorter than 1e-12.
- T06: `checkFloor` with `prev.y == curr.y` at floor height (0/0) left unguarded; `simulate` ends the flight on first floor contact, so it cannot occur.
- T06: test literals 9, 4.5, 9.1, 4.6, 4.8 kept; they are positions, not constants from `constants.js`.
- T07: accepted the one-time `LineMaterial` resolution with its `shortcut:` comment; no resize hook, because the contract has none.
- T07: `setPath` with fewer than 2 samples left unguarded; `simulate` always returns at least 2.
- T07: accepted `clear()` hiding, `setPath()` showing, and the marker starting hidden.
- T08: accepted re-reading the view destination every frame, so `setServerPos` during the server view moves the camera smoothly.
- T09: sent one fix-up; removed an unused `PRESETS` import left from the stub.
- T09: "logs a Launch object" read as calling `onLaunch`; no `console.log` was merged. The check moves to `VISUAL_CHECKS.md`.
- T09: accepted Space ignoring key auto-repeat, and `setLaunch` not firing the View and Net height callbacks.
- T09: `setLaunch` does not change the View control, because a Launch has no view.

## Wave 2 (T10)

- T10: first worker stopped because its worktree started from the T01 commit; relaunched with a `git merge --ff-only main` step. New worktrees do not start from `main`'s tip.
- T10 row 4: asked the human (expected test value). Human chose option A: launch becomes pos (-1.5, 3.2, 2.0), azimuth 30, still expecting 'out'. `tasks/T10.md` still shows the old row.
- T10: accepted the final sample's velocity being interpolated between the two RK4 states; the card gives none and Sample needs one.
- T10: coordinator committed the worker's two files, on the same basis as wave 1.

## Wave 3 (T11, done by the coordinator)

- T11: done on `task/T11-integration` and merged with `--no-ff`, like the worker branches.
- T11: `controls.update()` runs before `rig.update()`, per the T08 free-view clamp decision.
- T11: the ball is hidden until the first launch; the card does not say, and a ball resting half in the floor at the origin looked wrong on paper.
- T11: playback finds samples by index (`time / PHYSICS_DT`) and interpolates position only; velocity passed to the rig is the earlier sample's.
- T11: ball spin is applied about the world-space `omega` axis (premultiply).
- T11: court disposal frees each mesh's geometry, material and texture.
- T11: every done-when check is visual, so all of them are in `VISUAL_CHECKS.md`; none was run in a browser.

## Visual round 1 (human feedback after T11)

- Net looked disconnected from the posts (net is 9.5 m, posts are 11 m apart): added four white cables from the net's top and bottom edges to the posts in `court.js`. No constant changed.
- T04: `PCFSoftShadowMap` (named on the card) no longer exists in three 0.187 and logged a warning; switched to `PCFShadowMap`, which is what three was already falling back to.
- T11: `THREE.Clock` is deprecated and logged a warning; switched `main.js` to `THREE.Timer`.

## Graphics pass (human asked for better graphics; chose "gym and materials" and "custom GLSL shaders")

- Not a task card: the plan had no graphics task. Done by the coordinator on `gfx/graphics-pass`.
- New module `src/scene/gym.js`, `createGym() -> THREE.Group`: hall walls and a lit ceiling, drawn only from inside so outside cameras see in. `CLAUDE.md` does not list it yet; the human owns that file.
- `court.js`: procedural wood-plank floor; the net is now a GLSL shader (procedural 10 cm mesh, sway, ripple on hit). `createCourt` keeps its contract and adds `group.userData.hitNet(point)`, which `main.js` calls when a flight ends `'net'`.
- Net no longer casts a shadow: a depth pass would ignore the shader's holes and draw a solid slab. Posts, cables and antennas still do.
- `marker.js`: the ring is a GLSL shader with an expanding pulse; ring radii 0.12 and 0.2 are unchanged. It needed its own `polygonOffset`, because the court's offset was hiding it.
- `trail.js`: still `Line2`; `LineMaterial`'s fragment shader is patched to fade behind the ball, brighten with speed, and glow at the head. The `color` argument is still the base colour.
- `lights.js`: ACES tone mapping and a prefiltered `RoomEnvironment` for reflections. Both ship with three; no new dependency.
- Checked in Chrome by the coordinator: scene renders, default launch, side view, landing ring, and net ripple all work, with no console errors or warnings.

## Wave 4 (T12, T13, T14)

- Human said to continue with the remaining planned tasks without a written answer on `VISUAL_CHECKS.md`; the coordinator had checked the main items in Chrome.
- Worker commits went through this time (no permission denial), so workers committed their own branches.
- T12: accepted landing x and z as two rows; accepted the readout box being added to `document.body` once.
- T13: accepted the Jump topspin serve's vertical angle moving from 4° to 5° (the card's own tuning rule). No physics file, constant or existing test changed.
- T13: accepted the +10% speed test checking distance only, as the card words it; the faster serve lands out.
- T13: "Outside spike" lands in. "Outside" is the hitter's position, not the outcome; left as is.
- T14: not deployed. Publishing to GitHub Pages leaves this machine and waits for the human. Only the relative-path build was confirmed.
- T14: help line given a dark background by the coordinator; pale text was unreadable on the wood floor.

## Waves 5 and 6 (T15, T16, done by the coordinator)

- T15 contract change (planned by the card): `createPanel` also takes `onSpeedChange(scale)`, `onPauseChange(paused)`, `onScrub(time)` and returns `setPlayback(time, flightTime)`. `CLAUDE.md` must be updated by the human.
- T15: scrubbing jumps to that time and playback carries on from there unless paused; dragging to 0 replays the flight.
- T15: ball spin is now computed from the playback time instead of accumulated per frame, so scrubbing backward works.
- T15: `setLaunch` now calls `onNetHeightChange` when the net height changes. Before, picking a preset after choosing Women left the court at the wrong height.
- T16 contract change: `createPanel` also takes `onCompareChange(on)` and returns `setLandingDiff(dx or null)`.
- T16: the landing difference is shown in the panel, not the console, to keep the no-`console.log` gate.
- T15 and T16 checked in Chrome by the coordinator: readout, quarter-speed replay, scrub, ghost path, landing difference (-1.73 m for 60 rpm topspin), preset net-height fix; no console errors.

## Housekeeping (human gave permission to update any file)

- `tasks/T10.md` row 4 updated to the launch the human chose (option A), so the card matches the test.
- `tasks/T04.md` updated to name `PCFShadowMap`, matching the code.
- `README.md` updated with the readout, presets, replay, compare and graphics sections.
- `CLAUDE.md` not updated: the file is read-only on disk, which looks like a deliberate lock, so the coordinator did not change its permissions.
- Backspin distance (36 m for the topspin serve with backspin) checked by hand: lift comes out about equal to the ball's weight at 95 km/h and 360 rpm, which is in line with real volleyball spin. No physics change.
- Not pushed: `main` is 39+ commits ahead of `origin/main`, and the repo's workflow deploys to GitHub Pages on every push to `main`, so a push publishes the site.
