import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/lib/storage';

import { migrate } from './migrations';
import { freshState, SCHEMA_VERSION, type PersistedState, type Settings } from './schema';

type Actions = {
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
};

export type AppState = PersistedState & Actions;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...freshState(),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetAll: () => set(freshState()),
    }),
    {
      name: 'app-state',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => mmkvStateStorage),
      migrate: (saved, version) => migrate(saved, version),
      partialize: ({ bites, sessions, pet, stats, settings }) => ({ bites, sessions, pet, stats, settings }),
    },
  ),
);
