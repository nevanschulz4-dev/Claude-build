// Lightweight procedural sound effects & ambience using the Web Audio API.
// No external assets — everything is synthesized on the fly.

import type { Rarity, LocationId } from '../data/types';
import type { Weather } from '../store/environmentStore';

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

interface AmbientHandle {
  stop: () => void;
}

let ambient: AmbientHandle | null = null;
let ambientKey: string | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.35;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

/** Call from a user gesture (e.g. first button press) to unlock audio on mobile browsers. */
export function unlockAudio(): void {
  getCtx();
}

export function setMuted(value: boolean): void {
  muted = value;
  if (masterGain) masterGain.gain.value = value ? 0 : 0.35;
  if (value) stopAmbient();
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.25,
  glideTo?: number,
  delay = 0,
) {
  const audioCtx = getCtx();
  if (!audioCtx || !masterGain || muted) return;
  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), start + duration);
  }
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function createNoiseBuffer(audioCtx: AudioContext, seconds = 2): AudioBuffer {
  const size = Math.floor(audioCtx.sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function noiseBurst(duration: number, filterFreq: number, filterType: BiquadFilterType, gainValue = 0.25, delay = 0) {
  const audioCtx = getCtx();
  if (!audioCtx || !masterGain || muted) return;
  const start = audioCtx.currentTime + delay;
  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer(audioCtx, duration + 0.1);
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(start);
  source.stop(start + duration + 0.05);
}

/** A short whoosh as the line is cast out. */
export function playCast(): void {
  noiseBurst(0.35, 1200, 'bandpass', 0.18);
  tone(500, 0.3, 'sine', 0.08, 180);
}

/** A small "plink" when a fish bites. */
export function playBite(): void {
  tone(720, 0.12, 'triangle', 0.22);
  tone(900, 0.1, 'sine', 0.15, undefined, 0.05);
}

/** Upward chirp on a successful hook-set. */
export function playHook(): void {
  tone(320, 0.18, 'sawtooth', 0.18, 760);
}

/** Rising chime on a successful catch — richer for rarer fish. */
export function playCatch(rarity: Rarity): void {
  const notesByRarity: Record<Rarity, number[]> = {
    common: [523, 659],
    uncommon: [523, 659, 784],
    rare: [523, 659, 784, 988],
    epic: [523, 659, 784, 988, 1318],
    legendary: [440, 554, 659, 880, 1109, 1318],
  };
  const notes = notesByRarity[rarity];
  notes.forEach((freq, i) => {
    tone(freq, 0.35, 'triangle', 0.18, undefined, i * 0.07);
  });
}

/** Soft thud when a fish escapes or the bite window is missed. */
export function playMiss(): void {
  tone(180, 0.35, 'sine', 0.2, 80);
}

/** A watery "plop" when a fish jumps and lands back in the water. */
export function playSplash(): void {
  noiseBurst(0.25, 1800, 'lowpass', 0.16);
  tone(220, 0.18, 'sine', 0.12, 90);
}

/** Cash register "cha-ching" for sales and quest rewards. */
export function playCoin(): void {
  tone(880, 0.12, 'square', 0.1);
  tone(1320, 0.18, 'square', 0.12, undefined, 0.06);
}

interface AmbientFilterConfig {
  freq: number;
  gain: number;
}

const AMBIENT_BY_BIOME: Record<string, AmbientFilterConfig> = {
  home: { freq: 500, gain: 0.04 },
  river: { freq: 900, gain: 0.06 },
  lake: { freq: 450, gain: 0.045 },
  ocean: { freq: 650, gain: 0.07 },
  swamp: { freq: 350, gain: 0.04 },
};

/** Starts a looping ambient drone for the given biome (and rain layer if stormy). Replaces any existing ambience. */
export function startAmbient(locationId: LocationId, weather: Weather): void {
  const key = `${locationId}:${weather}`;
  if (ambientKey === key) return;
  stopAmbient();
  const audioCtx = getCtx();
  if (!audioCtx || !masterGain || muted) return;
  ambientKey = key;

  const config = AMBIENT_BY_BIOME[locationId] ?? AMBIENT_BY_BIOME.home;

  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer(audioCtx, 4);
  source.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = config.freq;
  const gain = audioCtx.createGain();
  gain.gain.value = config.gain;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start();

  let rainSource: AudioBufferSourceNode | null = null;
  if (weather === 'rain') {
    rainSource = audioCtx.createBufferSource();
    rainSource.buffer = createNoiseBuffer(audioCtx, 4);
    rainSource.loop = true;
    const rainFilter = audioCtx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = 2500;
    const rainGain = audioCtx.createGain();
    rainGain.gain.value = 0.05;
    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    rainSource.start();
  }

  ambient = {
    stop: () => {
      source.stop();
      rainSource?.stop();
    },
  };
}

export function stopAmbient(): void {
  ambient?.stop();
  ambient = null;
  ambientKey = null;
}
