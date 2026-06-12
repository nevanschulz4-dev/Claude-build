import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RARITY_ORDER } from '../data/types';
import type { Rarity, LocationId } from '../data/types';
import { LOCATIONS } from '../data/locationData';
import { useGameStore } from './gameStore';

export type QuestType = 'catchAny' | 'catchRarity' | 'catchBiome' | 'discoverSpecies' | 'catchValue' | 'catchNight';

export interface Quest {
  id: string;
  type: QuestType;
  description: string;
  icon: string;
  target: number;
  progress: number;
  reward: number;
  rarity?: Rarity;
  biome?: LocationId;
  claimed: boolean;
}

interface RegisterCatchParams {
  rarity: Rarity;
  locationId: LocationId;
  value: number;
  isNewSpecies: boolean;
  isNight: boolean;
}

interface QuestState {
  date: string;
  quests: Quest[];
  totalClaimed: number;
  ensureDaily: () => void;
  registerCatch: (params: RegisterCatchParams) => void;
  claimReward: (questId: string) => boolean;
}

const FISHABLE_BIOMES = LOCATIONS.filter((l) => l.fishable);
const BIOME_NAMES: Record<string, string> = Object.fromEntries(LOCATIONS.map((l) => [l.id, l.name]));
const RARITY_LABELS: Record<Rarity, string> = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeQuest(type: QuestType): Quest {
  switch (type) {
    case 'catchAny': {
      const target = 3 + Math.floor(Math.random() * 3);
      return {
        id: uid(),
        type,
        description: `Catch ${target} fish of any kind`,
        icon: '🎣',
        target,
        progress: 0,
        reward: 30 * target,
        claimed: false,
      };
    }
    case 'catchRarity': {
      // Weighted toward easier rarities so dailies stay achievable.
      const pool: Rarity[] = ['uncommon', 'uncommon', 'rare', 'rare', 'epic'];
      const rarity = pool[Math.floor(Math.random() * pool.length)];
      const rewardByRarity: Record<Rarity, number> = {
        common: 50,
        uncommon: 90,
        rare: 200,
        epic: 450,
        legendary: 1200,
      };
      return {
        id: uid(),
        type,
        description: `Catch a ${RARITY_LABELS[rarity]} (or better) fish`,
        icon: '✨',
        target: 1,
        progress: 0,
        reward: rewardByRarity[rarity],
        rarity,
        claimed: false,
      };
    }
    case 'catchBiome': {
      const loc = FISHABLE_BIOMES[Math.floor(Math.random() * FISHABLE_BIOMES.length)];
      const target = 2 + Math.floor(Math.random() * 2);
      return {
        id: uid(),
        type,
        description: `Catch ${target} fish at the ${BIOME_NAMES[loc.id]}`,
        icon: loc.icon,
        target,
        progress: 0,
        reward: 50 * target,
        biome: loc.id,
        claimed: false,
      };
    }
    case 'discoverSpecies':
      return {
        id: uid(),
        type,
        description: 'Catch a fish species for the first time',
        icon: '📖',
        target: 1,
        progress: 0,
        reward: 150,
        claimed: false,
      };
    case 'catchValue': {
      const target = 100 + Math.floor(Math.random() * 4) * 50;
      return {
        id: uid(),
        type,
        description: `Catch fish worth a total of $${target}`,
        icon: '💰',
        target,
        progress: 0,
        reward: Math.round(target * 0.6),
        claimed: false,
      };
    }
    case 'catchNight':
      return {
        id: uid(),
        type,
        description: 'Catch a fish at night',
        icon: '🌙',
        target: 1,
        progress: 0,
        reward: 120,
        claimed: false,
      };
    default:
      throw new Error(`Unknown quest type: ${type}`);
  }
}

function generateDailyQuests(): Quest[] {
  const types: QuestType[] = ['catchAny', 'catchRarity', 'catchBiome', 'discoverSpecies', 'catchValue', 'catchNight'];
  // Shuffle and take 3 distinct quest types.
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  return types.slice(0, 3).map(makeQuest);
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      date: '',
      quests: [],
      totalClaimed: 0,

      ensureDaily: () => {
        const today = todayKey();
        if (get().date !== today) {
          set({ date: today, quests: generateDailyQuests() });
        }
      },

      registerCatch: ({ rarity, locationId, value, isNewSpecies, isNight }) => {
        const { quests } = get();
        const rarityIdx = RARITY_ORDER.indexOf(rarity);
        const updated = quests.map((q) => {
          if (q.claimed || q.progress >= q.target) return q;
          switch (q.type) {
            case 'catchAny':
              return { ...q, progress: Math.min(q.target, q.progress + 1) };
            case 'catchRarity':
              if (q.rarity && rarityIdx >= RARITY_ORDER.indexOf(q.rarity)) {
                return { ...q, progress: q.target };
              }
              return q;
            case 'catchBiome':
              if (q.biome === locationId) return { ...q, progress: Math.min(q.target, q.progress + 1) };
              return q;
            case 'discoverSpecies':
              if (isNewSpecies) return { ...q, progress: q.target };
              return q;
            case 'catchValue':
              return { ...q, progress: Math.min(q.target, q.progress + value) };
            case 'catchNight':
              if (isNight) return { ...q, progress: q.target };
              return q;
            default:
              return q;
          }
        });
        set({ quests: updated });
      },

      claimReward: (questId) => {
        const { quests } = get();
        const quest = quests.find((q) => q.id === questId);
        if (!quest || quest.claimed || quest.progress < quest.target) return false;
        useGameStore.getState().addMoney(quest.reward);
        set({
          quests: quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
          totalClaimed: get().totalClaimed + 1,
        });
        return true;
      },
    }),
    {
      name: 'pond-game-quests',
    },
  ),
);
