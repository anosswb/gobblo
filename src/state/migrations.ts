import { freshState, SCHEMA_VERSION, type PersistedState } from './schema';

/**
 * Migrations run at boot (zustand persist `migrate`). Each step takes the state saved
 * at version N and returns version N + 1. Unknown or broken data is merged onto fresh
 * defaults field by field, so nothing the user made is dropped.
 *
 * To add a step: bump SCHEMA_VERSION in schema.ts and add `steps[N]` here.
 */
type Step = (s: Record<string, unknown>) => Record<string, unknown>;

const steps: Record<number, Step> = {
  // 0 -> 1: first versioned schema. Version 0 = anything saved before versioning existed.
  0: (s) => s,
  // 1 -> 2: adds goodThings, reminders and new settings (accent, sounds, opt-ins). Defaults fill them.
  1: (s) => ({ ...s, goodThings: Array.isArray(s.goodThings) ? s.goodThings : [], reminders: Array.isArray(s.reminders) ? s.reminders : [] }),
  // 2 -> 3: Apple redesign. The old default tint (cobalt) becomes the new default (pink, the pet's colour).
  2: (s) => {
    const settings = isObject(s.settings) ? s.settings : {};
    return settings.accent === 'cobalt' ? { ...s, settings: { ...settings, accent: 'berry' } } : s;
  },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Deep-merge saved values onto defaults (saved wins; arrays are taken as saved). */
export function mergeDefaults<T>(defaults: T, saved: unknown): T {
  if (!isObject(defaults) || !isObject(saved)) {
    return (saved === undefined ? defaults : (saved as T)) as T;
  }
  const out: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(saved)) {
    const d = (defaults as Record<string, unknown>)[key];
    const v = saved[key];
    out[key] = isObject(d) && isObject(v) ? mergeDefaults(d, v) : v;
  }
  return out as T;
}

export function migrate(saved: unknown, fromVersion: number): PersistedState {
  let state: Record<string, unknown> = isObject(saved) ? { ...saved } : {};
  for (let v = Math.max(0, fromVersion); v < SCHEMA_VERSION; v++) {
    const step = steps[v];
    if (step) state = step(state);
  }
  return fixSettings(mergeDefaults(freshState(), state));
}

const FOCUS_SOUNDS: readonly string[] = ['none', 'rain', 'fire', 'autumn', 'brown'];

/** A saved focus sound that no longer exists ('keys', removed 2026-11) falls back to rain; anything else unknown to none. */
export function fixSettings<T extends { settings: { focusSound: string } }>(state: T): T {
  const f = state.settings.focusSound;
  if (FOCUS_SOUNDS.includes(f)) return state;
  return { ...state, settings: { ...state.settings, focusSound: f === 'keys' ? 'rain' : 'none' } };
}
