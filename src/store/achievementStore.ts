import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { ACHIEVEMENTS } from '../data/achievementData';
import type { AchievementContext } from '../data/achievementData';

interface AchievementState {
  claimedIds: string[];
  claim: (id: string, ctx: AchievementContext) => boolean;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      claimedIds: [],

      claim: (id, ctx) => {
        const { claimedIds } = get();
        if (claimedIds.includes(id)) return false;
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return false;
        if (def.progress(ctx) < def.target) return false;
        useGameStore.getState().addMoney(def.reward);
        set({ claimedIds: [...claimedIds, id] });
        return true;
      },
    }),
    {
      name: 'pond-game-achievements',
    },
  ),
);
