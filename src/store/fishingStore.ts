import { create } from 'zustand';
import type { GamePhase } from '../data/types';
import { useGameStore } from './gameStore';
import { useLocationStore } from './locationStore';
import { useEnvironmentStore } from './environmentStore';
import { useQuestStore } from './questStore';
import { ROD_UPGRADES } from '../data/decorData';
import { BAIT_BY_ID } from '../data/baitData';
import { LOCATION_BY_ID } from '../data/locationData';
import { FISH_BY_ID } from '../data/fishData';
import { rollFish, getReelConfig, type RolledFish } from '../utils/fishing';

const REEL_GRAVITY = 1.6;
const REEL_PULL = 2.4;
const REEL_BOUNCE = -0.35;
const IN_ZONE_RATE = 0.32;
const OUT_ZONE_RATE = 0.5;

export type ResultState = RolledFish | 'escaped' | 'missed' | null;

interface FishingState {
  phase: GamePhase;
  castTimer: number;
  biteTimer: number;
  biteWindowTimer: number;
  biteWindowMax: number;

  pendingFish: RolledFish | null;
  reelMarker: number;
  reelVelocity: number;
  reelProgress: number;
  reelTimeLeft: number;
  reelZoneCenter: number;
  reelZoneWidth: number;
  reelDriftSpeed: number;
  reelElapsed: number;
  isReeling: boolean;

  result: ResultState;
  activeCastBaitId: string | null;

  cast: () => void;
  cancel: () => void;
  hook: () => void;
  setReeling: (v: boolean) => void;
  tick: (delta: number) => void;
  acknowledgeResult: () => void;
}

function rodStats() {
  const rodId = useGameStore.getState().rodId;
  return ROD_UPGRADES.find((r) => r.id === rodId) ?? ROD_UPGRADES[0];
}

export const useFishingStore = create<FishingState>((set, get) => ({
  phase: 'idle',
  castTimer: 0,
  biteTimer: 0,
  biteWindowTimer: 0,
  biteWindowMax: 1,

  pendingFish: null,
  reelMarker: 0.5,
  reelVelocity: 0,
  reelProgress: 0.45,
  reelTimeLeft: 0,
  reelZoneCenter: 0.5,
  reelZoneWidth: 0.4,
  reelDriftSpeed: 0.6,
  reelElapsed: 0,
  isReeling: false,

  result: null,
  activeCastBaitId: null,

  cast: () => {
    const { phase } = get();
    if (phase !== 'idle') return;
    const gameState = useGameStore.getState();
    if (gameState.unlockedFishIds.length === 0) return;
    if (!LOCATION_BY_ID[useLocationStore.getState().currentLocationId].fishable) return;

    let castBaitId: string | null = null;
    if (gameState.activeBaitId && (gameState.ownedBait[gameState.activeBaitId] ?? 0) > 0) {
      castBaitId = gameState.activeBaitId;
      gameState.consumeActiveBait();
    }

    set({ phase: 'casting', castTimer: 0.6, result: null, activeCastBaitId: castBaitId });
  },

  cancel: () => {
    set({
      phase: 'idle',
      pendingFish: null,
      isReeling: false,
      activeCastBaitId: null,
    });
  },

  hook: () => {
    const { phase, pendingFish } = get();
    if (phase !== 'bite' || !pendingFish) return;
    const rod = rodStats();
    const reelConfig = getReelConfig(pendingFish.species.rarity, rod.reelWindowBonus);
    set({
      phase: 'reeling',
      reelMarker: 0.5,
      reelVelocity: 0,
      reelProgress: 0.45,
      reelTimeLeft: reelConfig.timeLimit,
      reelZoneWidth: reelConfig.zoneWidth,
      reelDriftSpeed: reelConfig.driftSpeed,
      reelZoneCenter: 0.5,
      reelElapsed: 0,
      isReeling: false,
    });
  },

  setReeling: (v) => set({ isReeling: v }),

  tick: (delta) => {
    const state = get();
    const rod = rodStats();

    switch (state.phase) {
      case 'casting': {
        const t = state.castTimer - delta;
        if (t <= 0) {
          const env = useEnvironmentStore.getState();
          const bait = state.activeCastBaitId ? BAIT_BY_ID[state.activeCastBaitId] : undefined;
          let biteSpeedMod = 1;
          if (env.isNight()) biteSpeedMod *= 0.75;
          if (env.weather === 'rain') biteSpeedMod *= 0.8;
          const speedBonus = rod.speedBonus + (bait?.speedBonus ?? 0);
          const biteTime = Math.max(0.5, (1.0 + Math.random() * 2.4) * (1 - speedBonus * 0.5) * biteSpeedMod);
          set({ phase: 'waiting', castTimer: 0, biteTimer: biteTime });
        } else {
          set({ castTimer: t });
        }
        break;
      }
      case 'waiting': {
        const t = state.biteTimer - delta;
        if (t <= 0) {
          const gameState = useGameStore.getState();
          const currentLocationId = useLocationStore.getState().currentLocationId;
          const habitatFish = gameState.unlockedFishIds.filter((id) =>
            FISH_BY_ID[id]?.habitats.includes(currentLocationId),
          );
          const fishPool = habitatFish.length > 0 ? habitatFish : gameState.unlockedFishIds;
          const env = useEnvironmentStore.getState();
          const bait = state.activeCastBaitId ? BAIT_BY_ID[state.activeCastBaitId] : undefined;
          let envLuckBonus = bait?.luckBonus ?? 0;
          if (env.isNight()) envLuckBonus += 0.18;
          if (env.weather === 'rain') envLuckBonus += 0.12;
          const pendingFish = rollFish(fishPool, rod.luckBonus + envLuckBonus, gameState.pondRating());
          const windowMax = Math.max(0.5, 1.05 + rod.reelWindowBonus * 0.5 - (pendingFish.species.rarity === 'legendary' ? 0.25 : 0));
          set({
            phase: 'bite',
            biteTimer: 0,
            pendingFish,
            biteWindowTimer: windowMax,
            biteWindowMax: windowMax,
          });
        } else {
          set({ biteTimer: t });
        }
        break;
      }
      case 'bite': {
        const t = state.biteWindowTimer - delta;
        if (t <= 0) {
          set({ phase: 'result', result: 'missed', pendingFish: null, biteWindowTimer: 0 });
        } else {
          set({ biteWindowTimer: t });
        }
        break;
      }
      case 'reeling': {
        let velocity = state.reelVelocity;
        velocity += (state.isReeling ? REEL_PULL : -REEL_GRAVITY) * delta;
        velocity = Math.max(-2.5, Math.min(2.5, velocity));

        let marker = state.reelMarker + velocity * delta;
        if (marker < 0) {
          marker = 0;
          velocity *= REEL_BOUNCE;
        } else if (marker > 1) {
          marker = 1;
          velocity *= REEL_BOUNCE;
        }

        const elapsed = state.reelElapsed + delta;
        const amplitude = (1 - state.reelZoneWidth) / 2;
        const zoneCenter = 0.5 + Math.sin(elapsed * state.reelDriftSpeed) * amplitude;
        const inZone = Math.abs(marker - zoneCenter) <= state.reelZoneWidth / 2;

        let progress = state.reelProgress + (inZone ? IN_ZONE_RATE : -OUT_ZONE_RATE) * delta;
        progress = Math.max(0, Math.min(1, progress));

        const timeLeft = state.reelTimeLeft - delta;

        if (progress >= 1 && state.pendingFish) {
          const gameState = useGameStore.getState();
          const isNewSpecies = !gameState.caughtSpeciesIds.includes(state.pendingFish.species.id);
          gameState.addCatch({
            speciesId: state.pendingFish.species.id,
            weight: state.pendingFish.weight,
            value: state.pendingFish.value,
          });
          useQuestStore.getState().registerCatch({
            rarity: state.pendingFish.species.rarity,
            locationId: useLocationStore.getState().currentLocationId,
            value: state.pendingFish.value,
            isNewSpecies,
          });
          set({ phase: 'result', result: state.pendingFish, pendingFish: null, isReeling: false });
        } else if (progress <= 0 || timeLeft <= 0) {
          set({ phase: 'result', result: 'escaped', pendingFish: null, isReeling: false });
        } else {
          set({
            reelMarker: marker,
            reelVelocity: velocity,
            reelProgress: progress,
            reelTimeLeft: timeLeft,
            reelZoneCenter: zoneCenter,
            reelElapsed: elapsed,
          });
        }
        break;
      }
      default:
        break;
    }
  },

  acknowledgeResult: () => {
    set({ phase: 'idle', result: null, pendingFish: null, activeCastBaitId: null });
  },
}));
