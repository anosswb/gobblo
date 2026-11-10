import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addBites, feed, FOOD, moveToTop, newDayCheck, newId, removeBite, reorder, rewardStart, splitBite, toggleDaily, type NewBite } from '@/features/bites/logic';
import { setTime, setWhen, type When } from '@/features/bites/when';
import { startTimer } from '@/features/focus/timer';
import { hasPlus, spendForPlus } from '@/features/plus/catalog';
import { mmkvStateStorage } from '@/lib/storage';

import { mergeDefaults, migrate } from './migrations';
import {
  freshState,
  SCHEMA_VERSION,
  type ActiveFocus,
  type Bite,
  type PersistedState,
  type Pet,
  type Reminder,
  type Session,
  type Settings,
  type Size,
} from './schema';

type Actions = {
  updateSettings: (patch: Partial<Settings>) => void;
  patchPet: (patch: Partial<Pet>) => void;
  /** the level-up card for this level was shown */
  markLevelSeen: (level: number) => void;
  /** Plus: grant a pack (store purchase on iOS) */
  unlock: (id: string) => void;
  /** Android: buy a pack with sparks; false if not enough */
  buyPlusWithSparks: () => boolean;
  resetAll: () => void;
  importState: (data: PersistedState) => void;
  onAppActive: (now?: Date) => void;
  // bites
  addBites: (items: NewBite[]) => string[];
  /** `day` (pet day key) is the picked date for 'date' */
  setBiteWhen: (id: string, when: When, day?: string) => void;
  /** minutes since midnight, or null to clear */
  setBiteTime: (id: string, minutes: number | null) => void;
  moveToTop: (id: string) => void;
  splitBite: (id: string, steps: { text: string; size: Size }[]) => string[];
  /** "I already did it" (hyperfocus happened without the timer): feed it now */
  feedDone: (id: string) => { sparks: number } | null;
  removeBite: (id: string) => Bite | undefined;
  restoreBite: (bite: Bite) => void;
  toggleDaily: (id: string) => void;
  reorderBites: (from: number, to: number) => void;
  // focus
  startFocus: (bite: { id: string | null; text: string; size: Size }, minutes: number, mode: Session['mode']) => void;
  patchFocus: (patch: Partial<ActiveFocus>) => void;
  /** ends the session; when `done`, the bite is fed and sparks are returned */
  endFocus: (done: boolean, spentMin: number) => { sparks: number } | null;
  // extras
  addGoodThing: (text: string) => void;
  removeGoodThing: (id: string) => void;
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  removeReminder: (id: string) => void;
  toggleSavedTip: (id: number) => void;
};

export type AppState = PersistedState & Actions;

const pick = ({ bites, sessions, pet, stats, settings, goodThings, reminders, savedTips, focus, unlocked }: PersistedState): PersistedState => ({
  bites,
  sessions,
  pet,
  stats,
  settings,
  goodThings,
  reminders,
  savedTips,
  focus,
  unlocked,
});

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedState>(
    (set, get) => ({
      ...freshState(),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      patchPet: (patch) => set((s) => ({ pet: { ...s.pet, ...patch } })),
      markLevelSeen: (level) => set((s) => ({ stats: { ...s.stats, seenLevel: Math.max(s.stats.seenLevel ?? 1, level) } })),
      unlock: (id) => set((s) => (s.unlocked.includes(id) ? {} : { unlocked: [...s.unlocked, id] })),
      buyPlusWithSparks: () => {
        const s = get();
        if (hasPlus(s.unlocked)) return true;
        const left = spendForPlus(s.stats.sparks);
        if (left === null) return false;
        // only the spendable sparks go down: stats.total (the level) is untouched
        set({ stats: { ...s.stats, sparks: left }, unlocked: [...s.unlocked, 'plus'] });
        return true;
      },
      resetAll: () => set(freshState()),
      importState: (data) => set(migrate(data, 0)),
      onAppActive: (now = new Date()) => {
        const patch = newDayCheck(pick(get()), now);
        if (patch) set(patch);
      },

      addBites: (items) => {
        const r = addBites(pick(get()), items);
        set({ bites: r.bites });
        return r.added;
      },
      removeBite: (id) => {
        const bite = get().bites.find((b) => b.id === id);
        set((s) => ({ bites: removeBite(s.bites, id) }));
        return bite;
      },
      restoreBite: (bite) => set((s) => ({ bites: [...s.bites.filter((b) => b.id !== bite.id), bite] })),
      toggleDaily: (id) => set((s) => ({ bites: toggleDaily(s.bites, id) })),
      reorderBites: (from, to) => set((s) => ({ bites: reorder(s.bites, from, to) })),
      setBiteWhen: (id, when, day) =>
        set((s) => ({ bites: s.bites.map((b) => (b.id === id ? setWhen(b, when, new Date(), s.settings.weekStartsMonday, day) : b)) })),
      setBiteTime: (id, minutes) => set((s) => ({ bites: s.bites.map((b) => (b.id === id ? setTime(b, minutes, new Date()) : b)) })),
      moveToTop: (id) => set((s) => ({ bites: moveToTop(s.bites, id) })),
      splitBite: (id, steps) => {
        const r = splitBite(get().bites, id, steps);
        set({ bites: r.bites });
        return r.added;
      },
      feedDone: (id) => {
        const s = get();
        const b = s.bites.find((x) => x.id === id);
        if (!b) return null;
        const now = Date.now();
        const min = FOOD[b.size].min;
        const session: Session = { id: newId(), biteText: b.text, plannedMin: 0, spentMin: min, mode: 'custom', startedAt: now - min * 60_000, endedAt: now, done: true, drifts: 0 };
        const r = feed(pick(s), id, session);
        set({ bites: r.bites, sessions: r.sessions, stats: r.stats });
        return { sparks: r.sparks };
      },

      startFocus: (bite, minutes, mode) => {
        const now = Date.now();
        const t = startTimer(now, minutes);
        set((s) => ({
          ...rewardStart(pick(s), mode === '2min'),
          focus: {
            biteId: bite.id,
            biteText: bite.text,
            size: bite.size,
            mode,
            ...t,
            drifts: 0,
            rodeWave: false,
            warned: false,
            notificationId: null,
          },
        }));
      },
      patchFocus: (patch) => set((s) => (s.focus ? { focus: { ...s.focus, ...patch } } : {})),
      endFocus: (done, spentMin) => {
        const s = get();
        const f = s.focus;
        if (!f) return null;
        const session: Session = {
          id: newId(),
          biteText: f.biteText,
          plannedMin: Math.round(f.totalMs / 60_000),
          spentMin,
          mode: f.mode,
          startedAt: f.startedAt,
          endedAt: Date.now(),
          done,
          drifts: f.drifts,
        };
        if (!done) {
          set({ focus: null, sessions: [...s.sessions, session].slice(-2000) });
          return null;
        }
        const r = f.biteId ? feed(pick(s), f.biteId, session) : feed({ ...pick(s), bites: s.bites }, '', session);
        set({ focus: null, bites: r.bites, sessions: r.sessions, stats: r.stats });
        return { sparks: r.sparks };
      },

      addGoodThing: (text) =>
        set((s) => ({ goodThings: [{ id: newId(), text: text.trim(), at: Date.now() }, ...s.goodThings].slice(0, 500) })),
      removeGoodThing: (id) => set((s) => ({ goodThings: s.goodThings.filter((g) => g.id !== id) })),
      addReminder: (r) => set((s) => ({ reminders: [...s.reminders, { ...r, id: newId() }] })),
      removeReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      toggleSavedTip: (id) =>
        set((s) => ({ savedTips: s.savedTips.includes(id) ? s.savedTips.filter((t) => t !== id) : [id, ...s.savedTips] })),
    }),
    {
      name: 'app-state',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => mmkvStateStorage),
      migrate: (saved, version) => migrate(saved, version),
      // deep-merge saved data onto fresh defaults, so settings added later (soundOnSilent…)
      // get their default instead of `undefined` on phones that already have data
      merge: (saved, current) => ({ ...current, ...mergeDefaults(freshState(), saved) }),
      partialize: (s) => pick(s),
    },
  ),
);

/** Plain snapshot of the persisted data (for backup and the nudge scheduler). */
export const snapshot = (): PersistedState => pick(useAppStore.getState());
