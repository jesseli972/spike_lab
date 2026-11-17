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
