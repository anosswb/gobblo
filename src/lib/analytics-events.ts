import { PALETTES } from '@/theme/tokens';

/**
 * The closed list of anonymous analytics events (docs/16 #12, docs/19-analytics.md).
 *
 * Rules, enforced here and in analytics.test.ts:
 * - an event name is one of the keys below, nothing else;
 * - a prop is one of the keys listed for that event;
 * - a prop value is a boolean ('bool'), a number ('num') or one string from a short list
 *   written in this file. There is NO free-text prop: no bite text, reminder text, pet name,
 *   typed input or file name can ever be sent. `clean()` drops anything else at runtime.
 */

/** Screen names (expo-router paths mapped by `screenName`). */
export const SCREENS = [
  'home',
  'me',
  'closet',
  'onboarding',
  'dump',
  'focus',
  'settings',
  'settings_look',
  'settings_sound',
  'settings_nudges',
  'settings_focus',
  'settings_pet',
  'settings_time',
  'settings_privacy',
  'settings_about',
  'settings_faq',
  'reminders',
  'tools',
  'tool',
  'plus',
  'start',
  'spin',
  'other',
] as const;
export type ScreenName = (typeof SCREENS)[number];

export const TOOLS = ['unstick', 'calm', 'pick', 'reminders', 'other'] as const;

export const ONBOARDING_STEPS = ['hook', 'quiz', 'feed', 'hatch', 'name', 'nudge'] as const;

/** Settings keys whose CHANGE may be counted (key only, never the value). */
export const SETTINGS_KEYS = [
  'theme',
  'palette',
  'sound',
  'haptics',
  'reduceMotion',
  'nudge',
  'nudgeSound',
  'focusSound',
  'mixWithMusic',
  'soundOnSilent',
  'volume',
  'quietStart',
  'quietEnd',
  'defaultTimer',
  'petTalk',
  'autoSleep',
  'weekStartsMonday',
  'clock24h',
  'confetti',
  'oneThingMode',
  'biometricLock',
  'mindfulNote',
  'goodThingsJar',
  'nudgeTime',
  'focusKeepAwake',
  'adOffers',
  'shareUsage',
] as const;

/** First part of a lib/ads reason code (the text after ':' is never sent). */
export const AD_REASONS = [
  'none',
  'consent-denied',
  'consent-error',
  'init-error',
  'load-timeout',
  'load-error',
  'show-error',
  'no-module',
  'other',
] as const;

const bool = 'bool' as const;
const num = 'num' as const;

/** Every event and its allowed props. A prop is 'bool', 'num' or a readonly list of short strings. */
export const EVENTS = {
  app_opened: { first_open: bool },
  session_end: { seconds: num },
  screen: { name: SCREENS },
  onboarding_step: { step: ONBOARDING_STEPS, index: num },
  onboarding_done: { nudges_on: bool },
  bite_added: { source: ['home', 'dump', 'unstick', 'onboarding', 'routine'] as const, size: num },
  focus_started: { minutes: num, preset: ['2min', '15', '25', 'custom'] as const, source: ['bite', 'free'] as const },
  focus_ended: { outcome: ['done', 'left', 'expired'] as const, minutes: num },
  bite_fed: { size: num, sparks: num, how: ['timer', 'already_done'] as const },
  level_up: { level: num },
  tool_opened: { tool: TOOLS },
  closet_item_got: { slot: ['hat', 'face', 'color', 'room', 'pack'] as const, how: ['level', 'sparks', 'plus', 'weekly'] as const },
  theme_picked: { palette: PALETTES, scheme: ['system', 'light', 'dark'] as const },
  ad_offer_shown: { left: num },
  ad_result: { result: ['earned', 'closed', 'unavailable'] as const, reason: AD_REASONS },
  plus_seen: {},
  plus_bought: {},
  plus_restored: { found: bool },
  nudges_choice: { level: ['off', 'gentle', 'normal', 'chaos'] as const },
  settings_changed: { key: SETTINGS_KEYS },
  rating_prompted: {},
} as const;

export type EventName = keyof typeof EVENTS;
type Spec = 'bool' | 'num' | readonly string[];

type ValueOf<S> = S extends 'bool' ? boolean : S extends 'num' ? number : S extends readonly (infer U)[] ? U : never;

/** The props an event may carry. Values are booleans, numbers or literal enums: never `string`. */
export type EventProps<E extends EventName> = { [K in keyof (typeof EVENTS)[E]]?: ValueOf<(typeof EVENTS)[E][K]> };

export type CleanProps = Record<string, boolean | number | string>;

export const isEventName = (v: unknown): v is EventName => typeof v === 'string' && Object.prototype.hasOwnProperty.call(EVENTS, v);

/**
 * Runtime guard: keeps only known props whose value matches the spec. Any string that is not
 * one of the listed values (free text) is dropped, whatever the type system said.
 */
export function clean(event: string, props: Record<string, unknown> | undefined): CleanProps | null {
  if (!isEventName(event)) return null;
  const spec = EVENTS[event] as Record<string, Spec>;
  const out: CleanProps = {};
  if (!props) return out;
  for (const [key, value] of Object.entries(props)) {
    if (!Object.prototype.hasOwnProperty.call(spec, key)) continue;
    const s = spec[key];
    if (s === 'bool') {
      if (typeof value === 'boolean') out[key] = value;
    } else if (s === 'num') {
      if (typeof value === 'number' && Number.isFinite(value)) out[key] = Math.round(value * 100) / 100;
    } else if (typeof value === 'string' && s.includes(value)) {
      out[key] = value;
    }
  }
  return out;
}

/** Rounds a duration to a coarse bucket (the upper bound), so exact times are never sent. */
export function bucket(value: number, edges: readonly number[]): number {
  for (const e of edges) if (value <= e) return e;
  return edges[edges.length - 1] + 1;
}

export const SECOND_BUCKETS = [10, 30, 60, 120, 300, 600, 1200, 1800, 3600] as const;
export const MINUTE_BUCKETS = [1, 2, 5, 10, 15, 25, 45, 60, 90] as const;

/** Settings › pages that exist (keep in sync with en.settings.pages). */
const SETTINGS_PAGES = ['look', 'sound', 'nudges', 'focus', 'pet', 'time', 'privacy', 'about', 'faq'];

/** Maps an expo-router pathname to a fixed screen name (+ the tool id for /tools/<id>). Params are never sent. */
export function screenName(pathname: string): { name: ScreenName; tool?: (typeof TOOLS)[number] } {
  const parts = pathname.split('?')[0].split('/').filter(Boolean);
  const [a, b] = parts;
  if (!a) return { name: 'home' };
  if (a === 'settings') {
    if (!b) return { name: 'settings' };
    return { name: SETTINGS_PAGES.includes(b) ? (`settings_${b}` as ScreenName) : 'other' };
  }
  if (a === 'tools') {
    if (!b) return { name: 'tools' };
    return { name: 'tool', tool: (TOOLS as readonly string[]).includes(b) ? (b as (typeof TOOLS)[number]) : 'other' };
  }
  const simple: readonly string[] = ['me', 'closet', 'onboarding', 'dump', 'focus', 'reminders', 'plus', 'start', 'spin'];
  return { name: simple.includes(a) ? (a as ScreenName) : 'other' };
}

/** 'load-error:3' → 'load-error'. Only the code prefix from AD_REASONS is ever sent. */
export function adReason(code: string | null): (typeof AD_REASONS)[number] {
  if (!code) return 'none';
  const first = code.split(' | ').pop() ?? '';
  const prefix = first.split(':')[0];
  return (AD_REASONS as readonly string[]).includes(prefix) ? (prefix as (typeof AD_REASONS)[number]) : 'other';
}
