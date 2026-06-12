import * as THREE from 'three';
import { useMemo } from 'react';

/** Deterministic pseudo-random generator (mulberry32) so texture generation stays pure. */
function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Creates a small stepped gradient texture for use with MeshToonMaterial. */
export function useToonGradient(steps = 4): THREE.DataTexture {
  return useMemo(() => {
    const size = steps;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor((i / (size - 1)) * 255);
    }
    const texture = new THREE.DataTexture(data, size, 1, THREE.RedFormat);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }, [steps]);
}

/** Procedural tileable grass texture with mottled patches for a stylized look. */
export function useGrassTexture(): THREE.Texture {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#6FCB6A';
    ctx.fillRect(0, 0, size, size);

    const colors = ['#7DDB76', '#5FB85B', '#84E07C', '#69BE63'];
    const rng = makeRng(1);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
      const x = rng() * size;
      const y = rng() * size;
      const r = 2 + rng() * 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/** Procedural muddy swamp ground texture. */
export function useMudTexture(): THREE.Texture {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#5C5238';
    ctx.fillRect(0, 0, size, size);

    const colors = ['#4A4530', '#6B5F40', '#3E3A28', '#544B30'];
    const rng = makeRng(3);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
      const x = rng() * size;
      const y = rng() * size;
      const r = 2 + rng() * 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/** Procedural sandy/stone texture for the pond rim and paths. */
export function useSandTexture(): THREE.Texture {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#E8D7A8';
    ctx.fillRect(0, 0, size, size);

    const colors = ['#DCC795', '#F2E4BB', '#D8C28A'];
    const rng = makeRng(2);
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
      const x = rng() * size;
      const y = rng() * size;
      const r = 1 + rng() * 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}
