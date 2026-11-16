import { NET_HEIGHT_MEN } from '../constants.js';

const KMH = 1 / 3.6;

export const PRESETS = [
  {
    name: 'Float serve',
    launch: {
      pos: { x: -9.5, y: 2.6, z: 0 },
      speed: 65 * KMH,
      azimuthDeg: 0,
      elevationDeg: 12,
      spinType: 'none',
      spinRpm: 0,
      netHeight: NET_HEIGHT_MEN,
    },
  },
  {
    name: 'Jump topspin serve',
    launch: {
      pos: { x: -9.0, y: 3.1, z: 0 },
      speed: 95 * KMH,
      azimuthDeg: 0,
      elevationDeg: 4,
      spinType: 'top',
      spinRpm: 360,
      netHeight: NET_HEIGHT_MEN,
    },
  },
  {
    name: 'Outside spike',
    launch: {
      pos: { x: -1.5, y: 3.2, z: -3.0 },
      speed: 80 * KMH,
      azimuthDeg: 20,
      elevationDeg: -17,
      spinType: 'top',
      spinRpm: 300,
      netHeight: NET_HEIGHT_MEN,
    },
  },
];
