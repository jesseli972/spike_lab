# Validation

Scenario checks run in `tests/scenarios.test.js` through `simulate`. Values below come from the same run. Landing is the floor point (x, z) in metres. Clearance is the ball's height above the net top at the net plane, in metres.

| Scenario | Inputs | Landing (x, z) | Flight time (s) | Net clearance (m) | Outcome | Check | Pass or fail |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Float serve (preset) | Contact (-9.5, 2.6, 0), 65 km/h, aim 0°, vertical 12°, no spin, net 2.43 m | (8.73, 0.00) | 1.194 | 0.514 | in | Outcome `in`, clearance 0.05 to 1.0 m | Pass |
| Jump topspin serve (preset) | Contact (-9.0, 3.1, 0), 95 km/h, aim 0°, vertical 5°, top 360 rpm, net 2.43 m | (7.15, 0.00) | 0.708 | 0.076 | in | Outcome `in`, clearance 0.05 to 1.0 m | Pass |
| Outside spike (preset) | Contact (-1.5, 3.2, -3.0), 80 km/h, aim 20°, vertical -17°, top 300 rpm, net 2.43 m | (4.90, -0.67) | 0.347 | 0.126 | in | Outcome `in`, clearance 0.05 to 1.0 m | Pass |
| Topspin vs no spin | Jump topspin serve launch, spin none 0 rpm | (14.45, 0.00) | 1.076 | 0.720 | out | Topspin landing is at least 1 m shorter (7.15 vs 14.45, 7.30 m shorter) | Pass |
| Backspin vs no spin | Jump topspin serve launch, spin back 360 rpm | (36.18, 0.00) | 2.496 | 1.364 | out | Backspin landing is farther than no spin (36.18 vs 14.45) | Pass |
| Speed +10% on float serve | Float serve launch, speed 71.5 km/h | (11.03, 0.00) | 1.246 | 0.787 | out | Landing is farther than the base serve (11.03 vs 8.73) | Pass |

Notes:

- The spin comparisons use the Jump topspin serve. Its no-spin and backspin variants are not in play (they land beyond x = 9), so only landing distance is checked for them.
- The +10% speed check passes on distance only. The faster float serve lands past the back line, so its outcome is `out`.
- The panel defaults (contact (-9.5, 2.6, 0), 65 km/h, aim 0°, vertical 12°, no spin, net 2.43 m) match the Float serve preset. They land in with clearance 0.514 m, so the panel needs no change.

## Final preset values

Only the Jump topspin serve changed. Its vertical angle went from 4° to 5°. The first 1° step that passes at 95 km/h is 5°, so speed stayed at 95 km/h. At 4° the ball hit the net.

| Preset | Contact (x, y, z) | Speed | Aim | Vertical | Spin | Net height |
| --- | --- | --- | --- | --- | --- | --- |
| Float serve | (-9.5, 2.6, 0) | 65 km/h | 0° | 12° | none, 0 rpm | NET_HEIGHT_MEN (2.43 m) |
| Jump topspin serve | (-9.0, 3.1, 0) | 95 km/h | 0° | 5° | top, 360 rpm | NET_HEIGHT_MEN (2.43 m) |
| Outside spike | (-1.5, 3.2, -3.0) | 80 km/h | 20° | -17° | top, 300 rpm | NET_HEIGHT_MEN (2.43 m) |
