import { HATS, FACES, COLORS, ROOMS } from '@/features/closet/items';
import { levelOf } from '@/features/progress/logic';
import type { Settings, Size } from '@/state/schema';

import { track } from './analytics';
import { bucket, MINUTE_BUCKETS, SETTINGS_KEYS } from './analytics-events';

/**
 * The store-side analytics (src/state/app-store.ts calls these). Only fixed enums, numbers and
 * booleans: never a bite's text, a pet name or anything typed.
 */

/** A settings patch was applied: count which known keys changed (key only), plus a few choices. */
export function trackSettings(prev: Settings, next: Settings): void {
  for (const key of SETTINGS_KEYS) {
    if (prev[key] !== next[key]) track('settings_changed', { key });
  }
  if (prev.palette !== next.palette) track('theme_picked', { palette: next.palette });
  if (prev.theme !== next.theme) track('theme_picked', { scheme: next.theme });
  if (prev.nudge !== next.nudge) track('nudges_choice', { level: next.nudge });
  if (!prev.onboarded && next.onboarded) track('onboarding_done', { nudges_on: next.nudge !== 'off' });
}

export type BiteSource = 'home' | 'dump' | 'unstick' | 'onboarding' | 'routine';

export function trackBitesAdded(sizes: Size[], source: BiteSource): void {
  // a brain dump can add many: one event per bite, capped
  for (const size of sizes.slice(0, 20)) track('bite_added', { source, size });
}

export function trackFed(size: Size, sparks: number, how: 'timer' | 'already_done'): void {
  track('bite_fed', { size, sparks, how });
}

export function trackFocusEnded(outcome: 'done' | 'left' | 'expired', spentMin: number): void {
  track('focus_ended', { outcome, minutes: bucket(spentMin, MINUTE_BUCKETS) });
}

const ALL_ITEMS = [...HATS, ...FACES, ...COLORS, ...ROOMS];

/** Lifetime sparks went up: one level_up per new level, and the closet items that level gives. */
export function trackLevels(prevTotal: number, nextTotal: number): void {
  const from = levelOf(prevTotal);
  const to = levelOf(nextTotal);
  for (let level = from + 1; level <= to; level++) {
    track('level_up', { level });
    for (const item of ALL_ITEMS) {
      if (item.unlock.type === 'level' && item.unlock.level === level) track('closet_item_got', { slot: item.slot, how: 'level' });
    }
  }
}
