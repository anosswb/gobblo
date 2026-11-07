import type { PetColor } from '@/theme/tokens';

/**
 * Persisted data model (docs/01 + DECISIONS.md). Bump SCHEMA_VERSION and add a step
 * in migrations.ts for every shape change. Never lose user data on update.
 */
export const SCHEMA_VERSION = 3;

export type Size = 0 | 1 | 2 | 3; // tiny, small, medium, big
export type ThemePreference = 'system' | 'light' | 'dark';
export type NudgeLevel = 'off' | 'gentle' | 'normal' | 'chaos';
export type HapticLevel = 'off' | 'soft' | 'strong';
export type PetTalk = 'chatty' | 'quiet' | 'silent';
export type ConfettiAmount = 'lots' | 'little' | 'none';
export type Accent = 'cobalt' | 'berry' | 'jade' | 'sunset';
export type NudgeSound = 'boop' | 'chime' | 'pop' | 'loud';
export type FocusSound = 'none' | 'brown' | 'rain' | 'keys';

export interface Bite {
  id: string;
  text: string;
  size: Size;
  example?: boolean;
  /** "keep daily": stays on the plate every day (free, DECISIONS.md) */
  daily?: boolean;
  /** local day (todayKey) a daily bite was last eaten; it comes back the next day */
  doneOn?: string;
  createdAt: number;
  order: number;
}

export interface Session {
  id: string;
  biteText: string;
  plannedMin: number;
  spentMin: number;
  mode: '2min' | '15' | '25' | 'custom';
  startedAt: number;
  endedAt: number;
  done: boolean;
  drifts: number;
}

export interface Pet {
  name: string;
  color: PetColor;
  /** Closet: what the pet wears (src/pet/wardrobe.tsx ids) */
  hat: string;
  face: string;
  /** the face shown on Home: a Mood, or 'auto' (reacts to your day) */
  mood: string;
  /** Home stage background (src/features/closet/items.ts ROOMS) */
  room: string;
  owned: string[];
}

export interface Stats {
  sparks: number;
  total: number;
  eaten: number;
  minutes: number;
  comebacks: number;
  lastVisit: string;
  todayEaten: number;
  starts2: number;
  byPart: { morning: number; day: number; night: number };
  /** highest level already celebrated (the level-up card shows once per level) */
  seenLevel: number;
}

export interface GoodThing {
  id: string;
  text: string;
  at: number;
}

/** "leaving soon": I have to leave at a time, nudge me before (time blindness). */
export interface Reminder {
  id: string;
  text: string;
  at: number; // when the user must leave / start
  leadMin: number; // nudge this many minutes before
  notificationId?: string;
}

/** The running focus session, stored so the wall-clock timer survives the app being killed. */
export interface ActiveFocus {
  biteId: string | null;
  biteText: string;
  size: Size;
  mode: Session['mode'];
  startedAt: number;
  endsAt: number;
  pausedRemaining: number | null;
  totalMs: number;
  drifts: number;
  rodeWave: boolean;
  warned: boolean;
  notificationId: string | null;
}

export interface Settings {
  theme: ThemePreference;
  accent: Accent;
  sound: boolean;
  haptics: HapticLevel;
  reduceMotion: boolean;
  nudge: NudgeLevel;
  nudgeSound: NudgeSound;
  focusSound: FocusSound;
  mixWithMusic: boolean;
  /** play sounds even when the phone is on silent / vibrate (default on) */
  soundOnSilent: boolean;
  volume: number; // 0..1
  quietStart: number; // hour, local
  quietEnd: number;
  defaultTimer: 2 | 5 | 15 | 25;
  petTalk: PetTalk;
  autoSleep: boolean;
  weekStartsMonday: boolean;
  clock24h: boolean;
  confetti: ConfettiAmount;
  oneThingMode: boolean;
  biometricLock: boolean;
  /** opt-in, off by default (docs/12) */
  mindfulNote: boolean;
  /** opt-in "one good thing?" after feeding (docs/12) */
  goodThingsJar: boolean;
  onboarded: boolean;
  firstOpen: number;
  reviewAskedVersion?: string;
}

export interface PersistedState {
  bites: Bite[];
  sessions: Session[];
  pet: Pet;
  stats: Stats;
  settings: Settings;
  goodThings: GoodThing[];
  reminders: Reminder[];
  focus: ActiveFocus | null;
  /** Plus packs owned ('startKit' | 'makeItYours' | 'focus', or 'plus' for all) */
  unlocked: string[];
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function freshState(now = Date.now()): PersistedState {
  return {
    bites: [],
    sessions: [],
    pet: { name: 'Bean', color: 'pink', hat: 'none', face: 'none', mood: 'auto', room: 'auto', owned: ['none'] },
    stats: {
      sparks: 0,
      total: 0,
      eaten: 0,
      minutes: 0,
      comebacks: 1,
      lastVisit: todayKey(new Date(now)),
      todayEaten: 0,
      starts2: 0,
      byPart: { morning: 0, day: 0, night: 0 },
      seenLevel: 1,
    },
    goodThings: [],
    reminders: [],
    focus: null,
    unlocked: [],
    settings: {
      theme: 'system',
      accent: 'berry',
      sound: true,
      haptics: 'soft',
      reduceMotion: false,
      nudge: 'gentle',
      nudgeSound: 'boop',
      focusSound: 'none',
      mixWithMusic: true,
      soundOnSilent: true,
      volume: 0.7,
      quietStart: 22,
      quietEnd: 8,
      defaultTimer: 2,
      petTalk: 'chatty',
      autoSleep: true,
      weekStartsMonday: true,
      clock24h: false,
      confetti: 'lots',
      oneThingMode: false,
      biometricLock: false,
      mindfulNote: false,
      goodThingsJar: false,
      onboarded: false,
      firstOpen: now,
    },
  };
}
