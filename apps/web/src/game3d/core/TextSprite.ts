import * as THREE from 'three';

/**
 * Membuat sprite teks dinamis 2D di atas objek 3D (misalnya nama tim di atas mobil,
 * bar HP di atas musuh, atau angka koin melayang) yang selalu menghadap kamera.
 */
export function createTextSprite(
  text: string,
  options: {
    textColor?: string;
    bgColor?: string;
    borderColor?: string;
    fontSize?: number;
    width?: number;
    height?: number;
    badge?: string;
  } = {}
): { sprite: THREE.Sprite; updateText: (newText: string, newBadge?: string) => void; dispose: () => void } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const width = options.width || 256;
  const height = options.height || 64;
  canvas.width = width;
  canvas.height = height;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width / 60, height / 60, 1);

  const draw = (txt: string, badge?: string) => {
    ctx.clearRect(0, 0, width, height);

    // Background pill rounded
    const radius = 16;
    ctx.fillStyle = options.bgColor || 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(4, 4, width - 8, height - 8, radius);
    ctx.fill();

    // Border
    ctx.strokeStyle = options.borderColor || 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text label
    ctx.fillStyle = options.textColor || '#ffffff';
    ctx.font = `bold ${options.fontSize || 22}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fullText = badge ? `${badge} ${txt}` : txt;
    ctx.fillText(fullText, width / 2, height / 2);

    texture.needsUpdate = true;
  };

  draw(text, options.badge);

  return {
    sprite,
    updateText: (newText: string, newBadge?: string) => {
      draw(newText, newBadge);
    },
    dispose: () => {
      texture.dispose();
      material.dispose();
    },
  };
}

/**
 * Membuat sprite mini bar HP untuk musuh Tower Defense di atas kepala
 */
export function createHpBarSprite(
  width = 128,
  height = 24
): { sprite: THREE.Sprite; updateHp: (current: number, max: number) => void; dispose: () => void } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = width;
  canvas.height = height;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width / 50, height / 50, 1);

  const draw = (cur: number, max: number) => {
    ctx.clearRect(0, 0, width, height);

    // Frame belakang
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(2, 2, width - 4, height - 4, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Persentase HP
    const pct = Math.max(0, Math.min(1, cur / Math.max(1, max)));
    const barWidth = (width - 8) * pct;

    // Warna bar: hijau -> kuning -> merah
    if (pct > 0.5) {
      ctx.fillStyle = '#22c55e';
    } else if (pct > 0.25) {
      ctx.fillStyle = '#f59e0b';
    } else {
      ctx.fillStyle = '#ef4444';
    }

    ctx.beginPath();
    ctx.roundRect(4, 4, barWidth, height - 8, 4);
    ctx.fill();

    texture.needsUpdate = true;
  };

  draw(10, 10);

  return {
    sprite,
    updateHp: (cur: number, max: number) => {
      draw(cur, max);
    },
    dispose: () => {
      texture.dispose();
      material.dispose();
    },
  };
}

