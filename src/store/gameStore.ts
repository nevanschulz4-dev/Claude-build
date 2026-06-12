import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CaughtFish, PlacedDecoration } from '../data/types';
import { DECOR_BY_ID } from '../data/decorData';
import { FISH_BY_ID } from '../data/fishData';

export const MAX_INVENTORY = 16;

interface GameState {
  money: number;
  inventory: CaughtFish[];
  unlockedFishIds: string[];
  caughtSpeciesIds: string[];
  placedDecorations: PlacedDecoration[];
  waterThemeId: string;
  rodId: string;
  ownedWaterThemeIds: string[];
  ownedRodIds: string[];
  totalCatches: number;
  totalEarned: number;
  soundEnabled: boolean;

  // actions
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addCatch: (fish: Omit<CaughtFish, 'uid' | 'caughtAt'>) => boolean;
  sellFish: (uid: string) => void;
  sellAll: () => void;
  unlockFish: (speciesId: string, cost: number) => boolean;
  placeDecoration: (defId: string, position: [number, number, number], rotationY: number) => boolean;
  removeDecoration: (uid: string) => void;
  setWaterTheme: (id: string, cost: number) => boolean;
  buyRod: (id: string, cost: number) => boolean;
  pondRating: () => number;
  toggleSound: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 100,
      inventory: [],
      unlockedFishIds: ['sunfin', 'pebblecarp'],
      caughtSpeciesIds: [],
      placedDecorations: [],
      waterThemeId: 'classic',
      rodId: 'basic',
      ownedWaterThemeIds: ['classic'],
      ownedRodIds: ['basic'],
      totalCatches: 0,
      totalEarned: 0,
      soundEnabled: true,

      addMoney: (amount) => set((s) => ({ money: s.money + amount, totalEarned: s.totalEarned + Math.max(0, amount) })),

      spendMoney: (amount) => {
        const { money } = get();
        if (money < amount) return false;
        set({ money: money - amount });
        return true;
      },

      addCatch: (fish) => {
        const { inventory, caughtSpeciesIds } = get();
        if (inventory.length >= MAX_INVENTORY) return false;
        const entry: CaughtFish = {
          ...fish,
          uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          caughtAt: Date.now(),
        };
        const nextCaughtSpeciesIds = caughtSpeciesIds.includes(fish.speciesId)
          ? caughtSpeciesIds
          : [...caughtSpeciesIds, fish.speciesId];
        set({
          inventory: [...inventory, entry],
          totalCatches: get().totalCatches + 1,
          caughtSpeciesIds: nextCaughtSpeciesIds,
        });
        return true;
      },

      sellFish: (uid) => {
        const { inventory } = get();
        const fish = inventory.find((f) => f.uid === uid);
        if (!fish) return;
        set({
          inventory: inventory.filter((f) => f.uid !== uid),
          money: get().money + fish.value,
          totalEarned: get().totalEarned + fish.value,
        });
      },

      sellAll: () => {
        const { inventory } = get();
        if (inventory.length === 0) return;
        const total = inventory.reduce((sum, f) => sum + f.value, 0);
        set({ inventory: [], money: get().money + total, totalEarned: get().totalEarned + total });
      },

      unlockFish: (speciesId, cost) => {
        const { unlockedFishIds, money } = get();
        if (unlockedFishIds.includes(speciesId)) return false;
        if (money < cost) return false;
        set({ money: money - cost, unlockedFishIds: [...unlockedFishIds, speciesId] });
        return true;
      },

      placeDecoration: (defId, position, rotationY) => {
        const def = DECOR_BY_ID[defId];
        if (!def) return false;
        const { money } = get();
        if (money < def.cost) return false;
        const entry: PlacedDecoration = {
          uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          defId,
          position,
          rotationY,
        };
        set({ money: money - def.cost, placedDecorations: [...get().placedDecorations, entry] });
        return true;
      },

      removeDecoration: (uid) => {
        set({ placedDecorations: get().placedDecorations.filter((d) => d.uid !== uid) });
      },

      setWaterTheme: (id, cost) => {
        const { waterThemeId, ownedWaterThemeIds, money } = get();
        if (waterThemeId === id) return false;
        if (ownedWaterThemeIds.includes(id)) {
          set({ waterThemeId: id });
          return true;
        }
        if (cost > 0 && money < cost) return false;
        set({ waterThemeId: id, money: money - cost, ownedWaterThemeIds: [...ownedWaterThemeIds, id] });
        return true;
      },

      buyRod: (id, cost) => {
        const { rodId, ownedRodIds, money } = get();
        if (rodId === id) return false;
        if (ownedRodIds.includes(id)) {
          set({ rodId: id });
          return true;
        }
        if (cost > 0 && money < cost) return false;
        set({ rodId: id, money: money - cost, ownedRodIds: [...ownedRodIds, id] });
        return true;
      },

      pondRating: () => {
        const { placedDecorations, unlockedFishIds } = get();
        const decorRating = placedDecorations.reduce((sum, d) => sum + (DECOR_BY_ID[d.defId]?.ratingValue ?? 0), 0);
        const fishRating = unlockedFishIds.reduce((sum, id) => sum + (FISH_BY_ID[id] ? 1 : 0), 0) * 2;
        return decorRating + fishRating;
      },

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    }),
    {
      name: 'pond-game-save',
    },
  ),
);
