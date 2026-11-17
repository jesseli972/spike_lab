# Visual checks

Run `npm run dev` and open the page with the browser console showing.

## Already checked in Chrome by the coordinator

- The scene renders: gym hall, wood floor, court lines, net tied to the posts by cables, antennas.
- A default launch flies, the trail grows and fades, and the flight ends with a pulsing green ring.
- A short ball ends with a red ring; a net hit ripples the net and shows no ring.
- The readout shows the call and all five values with units; missing values show a dash.
- Broadcast and side views work.
- Replay: after a flight, playback speed 0.25 and dragging Scrub to 0 replays at quarter speed.
- Compare with last: the previous path stays as a dim trail, and the landing difference shows in the panel.
- Choosing a preset moves the sliders; choosing one after selecting the Women's net puts the net back to the preset's height.
- No console errors or warnings in any of the above.

## Still needs a human's eyes

- [ ] Server, follow and free views, during a flight and between flights. Follow should track without jitter. (T08)
- [ ] The mouse orbits only in free view, and the camera cannot be dragged below the floor. (T08)
- [ ] Switching views glides for about half a second with no jump. (T08)
- [ ] The Pause toggle freezes the ball mid-flight and resumes cleanly. (T15)
- [ ] Scrubbing backward and forward by hand, including while paused. (T15)
- [ ] The ball's coloured bands turn the right way: forward for topspin, backward for backspin, not at all for none. (T03)
- [ ] The ball's shadow is clear, meets the ball on landing, and shows near all four court corners. (T04)
- [ ] Switching Net height to Women lowers the net, and the next launch uses it. (T09, T11)
- [ ] Space launches when nothing is focused, not while typing in a field, and only once when the Launch button is focused. (T09)
- [ ] Resizing the window keeps the picture undistorted; note whether the trail's width looks off afterwards. (T14)
- [ ] The help line does not overlap the readout or the panel at small window sizes. (T14)
- [ ] The page works in a second browser. (T14)
- [ ] The live GitHub Pages link shows the same app. Not deployed yet. (T14)

## Known rough edges

- The wood floor shows some repetition from a distance.
- The net casts no shadow (its holes are drawn by a shader); posts, cables and antennas do.
- On a net hit the ball stays where it touched the net.
