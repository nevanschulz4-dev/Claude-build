import { create } from 'zustand';

export type PanelId = 'fishing' | 'build' | 'shop' | 'inventory' | 'travel' | 'encyclopedia' | 'quests' | null;

export interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'warning';
}

interface UIState {
  activePanel: PanelId;
  setActivePanel: (p: PanelId) => void;

  // Build mode
  buildSelection: string | null; // decoration defId selected for placement
  buildRemoveMode: boolean;
  buildRotation: number; // ghost preview rotation (radians), in build mode
  setBuildSelection: (id: string | null) => void;
  setBuildRemoveMode: (v: boolean) => void;
  rotateBuildSelection: () => void;

  // Toast notifications
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activePanel: null,
  setActivePanel: (p) => set((s) => ({ activePanel: s.activePanel === p ? null : p })),

  buildSelection: null,
  buildRemoveMode: false,
  buildRotation: 0,
  setBuildSelection: (id) => set({ buildSelection: id, buildRemoveMode: false, buildRotation: 0 }),
  setBuildRemoveMode: (v) => set({ buildRemoveMode: v, buildSelection: v ? null : get().buildSelection }),
  rotateBuildSelection: () => set((s) => ({ buildRotation: s.buildRotation + Math.PI / 4 })),

  toasts: [],
  pushToast: (message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
