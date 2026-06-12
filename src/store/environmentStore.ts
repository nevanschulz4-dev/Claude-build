import { create } from 'zustand';

export type Weather = 'clear' | 'rain';

/** Seconds for a full day/night cycle. */
export const DAY_LENGTH = 240;

interface EnvironmentState {
  /** 0-1 cycle position. 0/1 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset. */
  timeOfDay: number;
  weather: Weather;
  weatherTimer: number;
  tick: (delta: number) => void;
  isNight: () => boolean;
}

// Tick commits are throttled so subscribers (HUD, lighting) don't re-render every frame.
const TICK_INTERVAL = 0.5;
let accum = 0;

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  timeOfDay: 0.3,
  weather: 'clear',
  weatherTimer: 75 + Math.random() * 60,

  tick: (delta) => {
    accum += delta;
    if (accum < TICK_INTERVAL) return;
    const elapsed = accum;
    accum = 0;

    const { timeOfDay, weatherTimer, weather } = get();
    let nextTime = timeOfDay + elapsed / DAY_LENGTH;
    if (nextTime >= 1) nextTime -= 1;

    let nextWeather = weather;
    let nextTimer = weatherTimer - elapsed;
    if (nextTimer <= 0) {
      nextWeather = Math.random() < 0.3 ? 'rain' : 'clear';
      nextTimer = nextWeather === 'rain' ? 35 + Math.random() * 40 : 90 + Math.random() * 90;
    }

    set({ timeOfDay: nextTime, weather: nextWeather, weatherTimer: nextTimer });
  },

  isNight: () => {
    const t = get().timeOfDay;
    return t < 0.22 || t > 0.78;
  },
}));

/** -1 (deep night) .. 1 (noon), 0 at sunrise/sunset. */
export function getDayFactor(timeOfDay: number): number {
  return Math.sin((timeOfDay - 0.25) * Math.PI * 2);
}
