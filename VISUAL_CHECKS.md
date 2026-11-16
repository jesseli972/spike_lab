# Visual checks

Checks that need a human's eyes. Nothing below has been seen in a browser by anyone; the code builds and the 27 automated tests pass.

Run `npm run dev`, open the page, and open the browser console. Tick or note each line. The readout is still a stub (later task), so no numbers appear on screen yet.

## 1. First look (no launch yet)

- [ ] The console shows no errors or warnings. (T11)
- [ ] The court is drawn to scale: blue 18 x 9 surface on a grey floor, white lines, net, two posts, two striped antennas. The old helper grid is gone. (T02, T11)
- [ ] Attack lines sit 3 m from the net; the centre line is under the net. (T02)
- [ ] You can see through the net, and it has a white band along the top. (T02)
- [ ] Antennas have red and white stripes and stick up above the net. (T02)
- [ ] Net, posts and antennas cast shadows on the floor. Note whether the net's shadow is a solid dark slab; a see-through net may still cast a solid shadow. (T02, T04)
- [ ] The floor has no striped shadow artifacts. (T04)
- [ ] Lighting looks like a gym: soft fill, one clear sun direction, dark plain background. (T04)

## 2. Default launch

Press Launch without touching anything. Expected: the ball lands in, about 0.3 m inside the far end line, after about 1.2 s.

- [ ] The ball flies from the hitter's side over the net; a yellow trail grows behind it. (T07, T11)
- [ ] The trail is clearly thicker than 1 pixel. (T07)
- [ ] The flight takes about 1.2 s of real time. (T11)
- [ ] A green ring appears where the ball lands. (T07)
- [ ] The ball has a clear shadow on the floor, and the shadow meets the ball when it lands. (T04)
- [ ] The ball's shadow is visible near all four court corners (aim left and right, and use Contact x near -0.5 for a short ball). (T04)
- [ ] Pressing Launch again mid-flight restarts cleanly with no leftover trail or marker. (T11)

## 3. Spin and outcomes

| Change from default | Expected |
| --- | --- |
| Spin type top, 600 rpm | Dips into the net; no marker |
| Spin type back, 600 rpm | Floats long; red ring beyond the end line |
| Aim left/right 30 | Lands wide; red ring outside the sideline |
| Vertical angle 0 | Hits the net; no marker |

- [ ] Each row behaves as listed. (T10, T11)
- [ ] With spin on, the ball's coloured bands visibly turn; topspin rolls forward, backspin rolls backward. With spin "none" the pattern does not turn. (T03, T11)
- [ ] The ball design is three coloured bands on cream and does not look like a real brand's ball. (T03)

## 4. Camera views

- [ ] Each of broadcast, side, server, follow and free works, during a flight and between flights. (T08, T11)
- [ ] Switching between broadcast, side and server glides for about half a second; no jump. (T08)
- [ ] Follow tracks the ball smoothly without jitter, then eases back to the broadcast pose after the flight. (T08)
- [ ] The mouse orbits only in free view. (T08)
- [ ] In free view the camera cannot be dragged below the floor (it stops about 0.5 m up). (T08, T11)
- [ ] Server view sits just behind the contact point, and moves there after you change Contact x or z and launch. (T08, T11)

## 5. Panel

- [ ] Controls appear in this order: Contact x, Contact z, Contact height, Speed, Aim left/right, Vertical angle, Spin type, Spin, Net height, View, Launch. (T09)
- [ ] Defaults are -9.5, 0, 2.6, 65, 0, 12, none, 0, Men, broadcast. (T09)
- [ ] Space launches when nothing is focused. (T09)
- [ ] Space does not launch while typing in a number field. (T09)
- [ ] With the Launch button focused, Space launches once, not twice. (T09)
- [ ] Changing View or Net height takes effect once per change. (T09)
- [ ] Switching Net height to Women lowers the net, and the next launch uses the new height. (T09, T11)

## 6. Not checkable until later tasks

- "Pressing Launch logs a Launch object whose speed is in m/s" (T09): no `console.log` was merged. Speed conversion is covered only by reading the code (`km/h / 3.6`).
- `setLaunch(getLaunch())` changes nothing on screen (T09): nothing calls `setLaunch` yet; check it when presets arrive.
- Readout contents: `readout.js` is still a stub.

## Known rough edges (not bugs I could confirm)

- Resizing the window may leave the trail's width slightly off until reload; `trail.js` sets its pixel resolution once.
- Before the first launch the ball is hidden. That was my choice in T11; the card does not say.
