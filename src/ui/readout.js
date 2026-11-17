const CM_PER_M = 100;

const BOX_STYLE =
  'position:fixed;top:12px;left:12px;padding:10px 14px;min-width:200px;' +
  'background:rgba(0,0,0,0.6);color:#fff;border-radius:6px;pointer-events:none;' +
  'font:14px/1.5 system-ui,sans-serif;';

function fmt(value, digits, unit) {
  return value == null ? '-' : `${value.toFixed(digits)} ${unit}`;
}

function row(label, value) {
  const line = document.createElement('div');
  line.style.cssText = 'display:flex;justify-content:space-between;gap:16px;';
  const name = document.createElement('span');
  name.textContent = label;
  const num = document.createElement('span');
  num.textContent = value;
  line.append(name, num);
  return line;
}

export function createReadout() {
  const box = document.createElement('div');
  box.style.cssText = BOX_STYLE;
  document.body.appendChild(box);

  function show(result) {
    const { outcome, landing, flightTime, peakHeight, netClearance } = result;
    const word = document.createElement('div');
    word.style.cssText = `font-size:28px;font-weight:700;color:${outcome === 'in' ? '#3ddc84' : '#ff5252'};`;
    word.textContent = outcome.toUpperCase();

    const clearance = netClearance == null ? null : netClearance * CM_PER_M;
    box.replaceChildren(
      word,
      row('Landing x', landing ? fmt(landing.x, 2, 'm') : '-'),
      row('Landing z', landing ? fmt(landing.z, 2, 'm') : '-'),
      row('Flight time', fmt(flightTime, 2, 's')),
      row('Peak height', fmt(peakHeight, 2, 'm')),
      row('Net clearance', fmt(clearance, 0, 'cm')),
    );
  }

  function clear() {
    box.replaceChildren();
  }

  return { show, clear };
}
