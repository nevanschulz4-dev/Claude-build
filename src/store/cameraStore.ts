import { create } from 'zustand';

const MIN_DISTANCE = 6;
const MAX_DISTANCE = 50;
const MIN_POLAR = 0.3;
const MAX_POLAR = Math.PI / 2.05;
const PAN_LIMIT = 32;

const DEFAULT_TARGET: [number, number, number] = [0, 0.5, 0];
/** Default camera distance for fishing spots, which kept their original (smaller) size. */
export const FISHING_DISTANCE = Math.hypot(0, 6.5, 13);
/** Default camera distance for the home pond, pulled back further now that it's much larger. */
export const HOME_DISTANCE = Math.hypot(0, 13, 26);
const DEFAULT_POLAR = Math.acos(6.5 / FISHING_DISTANCE);
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
  resetView: (distance?: number) => void;
}

export const useCameraControls = create<CameraControlsState>((set) => ({
  target: DEFAULT_TARGET,
  azimuth: DEFAULT_AZIMUTH,
  polar: DEFAULT_POLAR,
  distance: HOME_DISTANCE,

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

  resetView: (distance = HOME_DISTANCE) =>
    set({
      target: DEFAULT_TARGET,
      azimuth: DEFAULT_AZIMUTH,
      polar: DEFAULT_POLAR,
      distance,
    }),
}));
