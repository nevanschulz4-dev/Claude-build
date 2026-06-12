import { create } from 'zustand';

const MIN_DISTANCE = 6;
const MAX_DISTANCE = 26;
const MIN_POLAR = 0.3;
const MAX_POLAR = Math.PI / 2.05;
const PAN_LIMIT = 16;

const DEFAULT_TARGET: [number, number, number] = [0, 0.5, 0];
const DEFAULT_DISTANCE = Math.hypot(0, 6.5, 13);
const DEFAULT_POLAR = Math.acos(6.5 / DEFAULT_DISTANCE);
const DEFAULT_AZIMUTH = Math.atan2(0, 13);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface CameraControlsState {
  target: [number, number, number];
  azimuth: number;
  polar: number;
  distance: number;
  /** Shift the look-at point across the ground (left-side drag). */
  pan: (dx: number, dz: number) => void;
  /** Orbit the camera around the look-at point (right-side drag). */
  look: (dAzimuth: number, dPolar: number) => void;
  zoom: (delta: number) => void;
  resetView: () => void;
}

export const useCameraControls = create<CameraControlsState>((set) => ({
  target: DEFAULT_TARGET,
  azimuth: DEFAULT_AZIMUTH,
  polar: DEFAULT_POLAR,
  distance: DEFAULT_DISTANCE,

  pan: (dx, dz) =>
    set((s) => {
      let x = s.target[0] + dx;
      let z = s.target[2] + dz;
      const len = Math.hypot(x, z);
      if (len > PAN_LIMIT) {
        const scale = PAN_LIMIT / len;
        x *= scale;
        z *= scale;
      }
      return { target: [x, s.target[1], z] };
    }),

  look: (dAzimuth, dPolar) =>
    set((s) => ({
      azimuth: s.azimuth + dAzimuth,
      polar: clamp(s.polar + dPolar, MIN_POLAR, MAX_POLAR),
    })),

  zoom: (delta) =>
    set((s) => ({
      distance: clamp(s.distance + delta, MIN_DISTANCE, MAX_DISTANCE),
    })),

  resetView: () =>
    set({
      target: DEFAULT_TARGET,
      azimuth: DEFAULT_AZIMUTH,
      polar: DEFAULT_POLAR,
      distance: DEFAULT_DISTANCE,
    }),
}));
