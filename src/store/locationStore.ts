import { create } from 'zustand';
import type { LocationId } from '../data/types';
import { useGameStore } from './gameStore';

interface LocationState {
  currentLocationId: LocationId;
  setLocation: (id: LocationId) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocationId: 'home',
  setLocation: (id) => {
    useGameStore.getState().visitLocation(id);
    set({ currentLocationId: id });
  },
}));
