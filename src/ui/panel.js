import GUI from 'lil-gui';
import { NET_HEIGHT_MEN, NET_HEIGHT_WOMEN } from '../constants.js';
import { PRESETS } from './presets.js';

const KMH = 1 / 3.6;

export function createPanel({
  viewNames, onLaunch, onViewChange, onNetHeightChange, onSpeedChange, onPauseChange, onScrub,
  onCompareChange,
}) {
  const state = {
    preset: PRESETS[0].name,
    contactX: -9.5,
    contactZ: 0,
    contactH: 2.6,
    speedKmh: 65,
    aimDeg: 0,
    vertDeg: 12,
    spinType: 'none',
    spinRpm: 0,
    netHeight: NET_HEIGHT_MEN,
    view: 'broadcast',
    launch: () => onLaunch(getLaunch()),
    playbackSpeed: 1,
    paused: false,
    scrub: 0,
    compare: false,
    landingDiff: '-',
  };

  const gui = new GUI({ title: 'Spike Lab' });
  gui
    .add(state, 'preset', PRESETS.map((p) => p.name))
    .name('Preset')
    .onChange((name) => setLaunch(PRESETS.find((p) => p.name === name).launch));
  gui.add(state, 'contactX', -12, -0.5).name('Contact x (m)');
  gui.add(state, 'contactZ', -4.5, 4.5).name('Contact z (m)');
  gui.add(state, 'contactH', 0.5, 3.8).name('Contact height (m)');
  gui.add(state, 'speedKmh', 20, 130).name('Speed (km/h)');
  gui.add(state, 'aimDeg', -30, 30).name('Aim left/right (°)');
  gui.add(state, 'vertDeg', -30, 45).name('Vertical angle (°)');
  gui.add(state, 'spinType', ['none', 'top', 'back']).name('Spin type');
  gui.add(state, 'spinRpm', 0, 600).name('Spin (rpm)');
  gui
    .add(state, 'netHeight', { Men: NET_HEIGHT_MEN, Women: NET_HEIGHT_WOMEN })
    .name('Net height')
    .onChange((h) => onNetHeightChange(h));
  gui
    .add(state, 'view', viewNames)
    .name('View')
    .onChange((name) => onViewChange(name));
  gui.add(state, 'launch').name('Launch');

  const replay = gui.addFolder('Replay');
  replay.add(state, 'playbackSpeed', 0.1, 1).name('Playback speed').onChange((v) => onSpeedChange(v));
  replay.add(state, 'paused').name('Pause').onChange((v) => onPauseChange(v));
  const scrub = replay.add(state, 'scrub', 0, 1).name('Scrub (s)').onChange((t) => onScrub(t));

  const compare = gui.addFolder('Compare');
  compare.add(state, 'compare').name('Compare with last').onChange((v) => onCompareChange(v));
  const landingDiff = compare.add(state, 'landingDiff').name('Landing x vs last').disable();

  // Space launches unless focus is in a field or button (a focused button already fires click).
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.repeat) return;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    e.preventDefault();
    state.launch();
  });

  function getLaunch() {
    return {
      pos: { x: state.contactX, y: state.contactH, z: state.contactZ },
      speed: state.speedKmh * KMH,
      azimuthDeg: state.aimDeg,
      elevationDeg: state.vertDeg,
      spinType: state.spinType,
      spinRpm: state.spinRpm,
      netHeight: state.netHeight,
    };
  }

  // Writes the values directly, so only a changed net height reports back (the court must follow it).
  function setLaunch(launch) {
    const netChanged = launch.netHeight !== state.netHeight;
    state.contactX = launch.pos.x;
    state.contactH = launch.pos.y;
    state.contactZ = launch.pos.z;
    state.speedKmh = launch.speed / KMH;
    state.aimDeg = launch.azimuthDeg;
    state.vertDeg = launch.elevationDeg;
    state.spinType = launch.spinType;
    state.spinRpm = launch.spinRpm;
    state.netHeight = launch.netHeight;
    gui.controllersRecursive().forEach((c) => c.updateDisplay());
    if (netChanged) onNetHeightChange(state.netHeight);
  }

  // Moves the scrub slider to match playback without firing onScrub.
  function setPlayback(time, flightTime) {
    if (scrub._max !== flightTime) scrub.max(flightTime);
    state.scrub = time;
    scrub.updateDisplay();
  }

  // Shows how much farther (+) or shorter (-) this flight landed than the last; null shows a dash.
  function setLandingDiff(dx) {
    state.landingDiff = dx == null ? '-' : `${dx >= 0 ? '+' : ''}${dx.toFixed(2)} m`;
    landingDiff.updateDisplay();
  }

  return { getLaunch, setLaunch, setPlayback, setLandingDiff };
}
