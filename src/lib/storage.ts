import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/** One MMKV store for the whole app (docs/04). All data stays on the device. */
export const storage = createMMKV({ id: 'gobblo' });

/** zustand persist adapter. */
export const mmkvStateStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
