import { FISH_BY_ID, FISH_SPECIES, RARITY_WEIGHTS } from '../data/fishData';
import { RARITY_ORDER } from '../data/types';
import type { FishSpecies, Rarity } from '../data/types';

export interface RolledFish {
  species: FishSpecies;
  weight: number;
  value: number;
}

/** Picks a fish species for a catch, weighted by rarity and influenced by rod luck + pond rating. */
export function rollFish(unlockedFishIds: string[], luckBonus: number, pondRating: number): RolledFish {
  const weights = RARITY_ORDER.map((rarity, idx) => RARITY_WEIGHTS[rarity] * Math.pow(1 + luckBonus, idx));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let chosenRarity: Rarity = 'common';
  for (let i = 0; i < RARITY_ORDER.length; i++) {
    if (roll < weights[i]) {
      chosenRarity = RARITY_ORDER[i];
      break;
    }
    roll -= weights[i];
  }

  // Find unlocked species matching the chosen rarity, falling back to lower rarities.
  let pool: FishSpecies[] = [];
  let rarityIdx = RARITY_ORDER.indexOf(chosenRarity);
  while (pool.length === 0 && rarityIdx >= 0) {
    const rarity = RARITY_ORDER[rarityIdx];
    pool = unlockedFishIds.map((id) => FISH_BY_ID[id]).filter((f) => f && f.rarity === rarity);
    rarityIdx--;
  }
  if (pool.length === 0) pool = [FISH_SPECIES[0]];

  const species = pool[Math.floor(Math.random() * pool.length)];
  const sizeFactor = 0.7 + Math.random() * 0.6;
  const weight = Math.round(species.size * sizeFactor * 2.4 * 100) / 100;
  const value = Math.max(1, Math.round(species.baseValue * sizeFactor * (1 + pondRating * 0.005)));

  return { species, weight, value };
}

export interface ReelConfig {
  zoneWidth: number;
  driftSpeed: number;
  timeLimit: number;
}

const REEL_BASE: Record<Rarity, ReelConfig> = {
  common: { zoneWidth: 0.46, driftSpeed: 0.6, timeLimit: 9 },
  uncommon: { zoneWidth: 0.38, driftSpeed: 0.85, timeLimit: 9 },
  rare: { zoneWidth: 0.3, driftSpeed: 1.15, timeLimit: 8.5 },
  epic: { zoneWidth: 0.23, driftSpeed: 1.45, timeLimit: 8 },
  legendary: { zoneWidth: 0.17, driftSpeed: 1.8, timeLimit: 7.5 },
};

export function getReelConfig(rarity: Rarity, reelWindowBonus: number): ReelConfig {
  const base = REEL_BASE[rarity];
  return {
    zoneWidth: Math.min(0.7, base.zoneWidth + reelWindowBonus),
    driftSpeed: base.driftSpeed,
    timeLimit: base.timeLimit,
  };
}
