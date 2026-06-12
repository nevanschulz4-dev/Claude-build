import { create } from 'zustand';
import type { LocationId } from '../data/types';

interface LocationState {
  currentLocationId: LocationId;
  setLocation: (id: LocationId) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocationId: 'home',
  setLocation: (id) => set({ currentLocationId: id }),
}));
