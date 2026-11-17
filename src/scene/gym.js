import * as THREE from 'three';

// The hall matches the 30 x 20 floor that court.js lays down.
const HALL_LENGTH = 30;
const HALL_WIDTH = 20;
const HALL_HEIGHT = 9;

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

// Painted block wall: pale blocks above, a padded blue band with a stripe along the bottom.
function wallTexture(repeatX) {
  const texture = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#d9d4c7';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    const rows = 14;
    for (let r = 0; r <= rows; r++) {
      const y = (r * h) / rows;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      const shift = r % 2 ? w / 16 : 0;
      for (let x = shift; x <= w; x += w / 8) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h / rows); ctx.stroke();
      }
    }
    ctx.fillStyle = '#1d3f6e';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    ctx.fillStyle = '#e8b23a';
    ctx.fillRect(0, h * 0.76, w, h * 0.02);
  });
  texture.repeat.set(repeatX, 1);
  return texture;
}

// Dark ceiling with rows of light panels; the same canvas drives the emissive glow.
function ceilingTexture() {
  const texture = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#15171b';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2a2e35';
    ctx.lineWidth = 6;
    for (let x = 0; x <= w; x += w / 4) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(col * (w / 4) + w / 16, row * (h / 3) + h / 8, w / 8, h / 24);
      }
    }
  });
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createGym() {
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const wall = (length) => new THREE.MeshStandardMaterial({
    map: wallTexture(length / 6), roughness: 0.9, side: THREE.BackSide,
  });
  const ceilingMap = ceilingTexture();
  const ceiling = new THREE.MeshStandardMaterial({
    map: ceilingMap, emissiveMap: ceilingMap, emissive: 0xfff4e0, emissiveIntensity: 2.5,
    roughness: 1, side: THREE.BackSide,
  });

  // BackSide walls are only drawn from inside, so cameras outside the hall see straight in.
  // Box face order: +x, -x, +y, -y, +z, -z. The floor face is hidden; court.js draws the floor.
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(HALL_LENGTH, HALL_HEIGHT, HALL_WIDTH),
    [wall(HALL_WIDTH), wall(HALL_WIDTH), ceiling, hidden, wall(HALL_LENGTH), wall(HALL_LENGTH)],
  );
  hall.position.y = HALL_HEIGHT / 2;
  hall.name = 'hall';

  const group = new THREE.Group();
  group.name = 'gym';
  group.add(hall);
  return group;
}
