import GUI from 'lil-gui';
import { NET_HEIGHT_MEN, NET_HEIGHT_WOMEN } from '../constants.js';

const KMH = 1 / 3.6;

export function createPanel({ viewNames, onLaunch, onViewChange, onNetHeightChange }) {
  const state = {
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
  };

  const gui = new GUI({ title: 'Spike Lab' });
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

  // Writes the values directly so no change callback fires.
  function setLaunch(launch) {
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
  }

  return { getLaunch, setLaunch };
}
