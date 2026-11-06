import type { PetColor } from '@/theme/tokens';

/**
 * Persisted data model (docs/01 + DECISIONS.md). Bump SCHEMA_VERSION and add a step
 * in migrations.ts for every shape change. Never lose user data on update.
 */
export const SCHEMA_VERSION = 1;

export type Size = 0 | 1 | 2 | 3; // tiny, small, medium, big
export type ThemePreference = 'system' | 'light' | 'dark';
export type NudgeLevel = 'off' | 'gentle' | 'normal' | 'chaos';
export type HapticLevel = 'off' | 'soft' | 'strong';
export type PetTalk = 'chatty' | 'quiet' | 'silent';
export type ConfettiAmount = 'lots' | 'little' | 'none';

export interface Bite {
  id: string;
  text: string;
  size: Size;
  example?: boolean;
  /** "keep daily": stays on the plate every day (free, DECISIONS.md) */
  daily?: boolean;
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
  hat: string;
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
}

export interface Settings {
  theme: ThemePreference;
  sound: boolean;
  haptics: HapticLevel;
  reduceMotion: boolean;
  nudge: NudgeLevel;
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
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function freshState(now = Date.now()): PersistedState {
  return {
    bites: [],
    sessions: [],
    pet: { name: 'Bean', color: 'pink', hat: 'none', owned: ['none'] },
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
    },
    settings: {
      theme: 'system',
      sound: true,
      haptics: 'soft',
      reduceMotion: false,
      nudge: 'gentle',
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
      onboarded: false,
      firstOpen: now,
    },
  };
}
