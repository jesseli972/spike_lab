import { PRESETS } from './presets.js';

export function createPanel({ viewNames, onLaunch, onViewChange, onNetHeightChange }) {
  return { getLaunch: () => PRESETS[0].launch, setLaunch(launch) {} };
}
