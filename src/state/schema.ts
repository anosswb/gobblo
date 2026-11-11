import type { Palette, PetColor } from '@/theme/tokens';

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
export type FocusSound = 'none' | 'rain' | 'fire' | 'autumn' | 'brown';
export type NudgeTime = 'morning' | 'afternoon' | 'evening';

export interface Bite {
  id: string;
  text: string;
  size: Size;
  example?: boolean;
  /** "keep daily": stays on the plate every day (free, DECISIONS.md) */
  daily?: boolean;
  /** pet day (dayKey, starts 4 am) a daily bite was last eaten; it comes back the next day */
  doneOn?: string;
  /** "when" chip (features/bites/when.ts): unset = today. Optional fields, no migration needed. */
  when?: 'tomorrow' | 'week' | 'someday' | 'date';
  /** pet day (dayKey) a Tomorrow / This week / picked-date bite comes onto the plate */
  showOn?: string;
  /** optional time: one ping then (outside the nudge cap, never in quiet hours) */
  at?: number;
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
  /** rewarded videos watched on one pet day (features/plus/ad-reward); optional, no migration */
  adSparks?: { day: string; count: number };
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
  /** days away before today's first open (2+ shows the welcome back); cleared once said hi */
  awayDays?: number;
}

export interface GoodThing {
  id: string;
  text: string;
  at: number;
}

/**
 * A reminder the user set (Toolkit › Reminders). Two kinds:
 * - "leave at" (time blindness): leadMin > 0, the pet nudges this many minutes before `at`
 * - "remind me at": leadMin 0, the pet nudges at `at`
 * `repeat: 'daily'` keeps the clock time of `at` every day (no migration: optional field).
 */
export interface Reminder {
  id: string;
  text: string;
  at: number; // when the user must leave / start (for daily: the first time, its clock time repeats)
  leadMin: number; // nudge this many minutes before (0 = at the time)
  repeat?: 'daily';
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
  /** colour theme (docs/16 #1) */
  palette: Palette;
  /** old tint picker: kept in saves, no longer used for colour (replaced by `palette`) */
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
  /** the drag-to-feed guide on Home was seen (dragged once or tapped Got it) */
  tipDragSeen: boolean;
  /** the one extra "can I nudge you?" card after "Not now" in onboarding was shown (never asks twice) */
  nudgeAskedAgain: boolean;
  /** when the pet's own nudges come (night owls pick evening) */
  nudgeTime: NudgeTime;
  /** keep the screen on during a focus timer (off saves battery) */
  focusKeepAwake: boolean;
  /** page guides already shown once (guide ids: 'home', 'breathe'…) */
  guidesSeen: string[];
  /** last pet week whose weekly card was closed (features/weekly) */
  weekSeen: number;
  firstOpen: number;
  /** app version we already asked for a store rating in (features/rating); optional, no migration */
  ratingAskedVersion?: string;
  /** Android: show the optional "watch a video for sparks" card (unset = on) */
  adOffers?: boolean;
  /** Settings › Privacy & data › Share anonymous usage: PostHog counts + Sentry crash reports (docs/19). Default on. */
  shareUsage: boolean;
}

export interface PersistedState {
  bites: Bite[];
  sessions: Session[];
  pet: Pet;
  stats: Stats;
  settings: Settings;
  goodThings: GoodThing[];
  reminders: Reminder[];
  /** Toolkit › Daily tip: ids of tips the user saved */
  savedTips: number[];
  focus: ActiveFocus | null;
  /** Plus: 'plus' once unlocked (old saves may hold 'startKit' | 'makeItYours' | 'focus', which count as Plus) */
  unlocked: string[];
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The pet's day starts at 4 am, not midnight, so a night owl's 1 am bite still counts for "today". */
export const DAY_START_HOUR = 4;

/** The pet's day (belly, daily bites, comeback days): like todayKey, but the day turns over at 4 am. */
export const dayKey = (d = new Date()) => todayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() - DAY_START_HOUR, d.getMinutes()));

export function freshState(now = Date.now()): PersistedState {
  return {
    bites: [],
    sessions: [],
    pet: { name: 'Pip', color: 'caramel', hat: 'none', face: 'none', mood: 'auto', room: 'auto', owned: ['none'] },
    stats: {
      sparks: 0,
      total: 0,
      eaten: 0,
      minutes: 0,
      comebacks: 1,
      lastVisit: dayKey(new Date(now)),
      todayEaten: 0,
      starts2: 0,
      byPart: { morning: 0, day: 0, night: 0 },
      seenLevel: 1,
    },
    goodThings: [],
    reminders: [],
    savedTips: [],
    focus: null,
    unlocked: [],
    settings: {
      theme: 'system',
      palette: 'ink',
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
      tipDragSeen: false,
      nudgeAskedAgain: false,
      nudgeTime: 'morning',
      focusKeepAwake: true,
      guidesSeen: [],
      weekSeen: 0,
      firstOpen: now,
      shareUsage: true,
    },
  };
}
