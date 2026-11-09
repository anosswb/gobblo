import { dayKey, type Session } from '@/state/schema';
import type { PetColor } from '@/theme/tokens';

/**
 * Week 2+ reasons to come back, all free and offline (DECISIONS 2026-11-09):
 * - a weekly surprise: from day 7, every pet week brings one new free pet colour
 * - a weekly recap card on Home that reveals it ("last week you fed Noodle 12 bites")
 * Nothing is ever lost: away for 3 weeks, all 3 colours are waiting. No streaks, no "missed".
 *
 * A "pet week" counts from the first open: week 0 is days 0–6, week 1 starts on day 7.
 * Days are pet days (4 am → 4 am, `dayKey`).
 */

/** One colour per pet week, from week 1 (day 7). After the last, the recap still comes. */
export const WEEKLY_COLORS: PetColor[] = ['peach', 'lime', 'lagoon', 'cocoa', 'plum', 'coral', 'denim', 'blush', 'storm', 'cherry'];

const DAY_MS = 86_400_000;
const keyToUtc = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Whole pet days between two moments (DST-proof: counts calendar keys). */
export const petDaysBetween = (from: Date, to: Date) => Math.round((keyToUtc(dayKey(to)) - keyToUtc(dayKey(from))) / DAY_MS);

/** Which pet week it is (0 in the first 7 days). */
export const petWeek = (firstOpen: number, now: Date) => Math.max(0, Math.floor(petDaysBetween(new Date(firstOpen), now) / 7));

/** The colour a week brings (week 1 → the first), or null. */
export const colorForWeek = (week: number): PetColor | null => (week >= 1 ? (WEEKLY_COLORS[week - 1] ?? null) : null);

/** Is this weekly colour yours yet? */
export function weeklyColorOpen(color: PetColor, week: number): boolean {
  const i = WEEKLY_COLORS.indexOf(color);
  return i >= 0 && week >= i + 1;
}

/** Fed bites and minutes in the 7 pet days before the current pet week began. */
export function lastWeekRecap(sessions: Session[], firstOpen: number, now: Date): { bites: number; minutes: number } {
  const week = petWeek(firstOpen, now);
  const first = new Date(firstOpen);
  let bites = 0;
  let minutes = 0;
  for (const s of sessions) {
    if (!s.done) continue;
    if (Math.floor(petDaysBetween(first, new Date(s.endedAt)) / 7) !== week - 1) continue;
    bites++;
    minutes += s.spentMin;
  }
  return { bites, minutes: Math.round(minutes) };
}

/** The recap card shows once per pet week, from week 1, until you close it. */
export const recapDue = (seenWeek: number, firstOpen: number, now: Date) => {
  const week = petWeek(firstOpen, now);
  return week >= 1 && seenWeek < week;
};

/** Pet days until a pet week starts (for "It arrives in 3 days"). */
export const daysUntilWeek = (firstOpen: number, week: number, now = new Date()) => Math.max(1, week * 7 - petDaysBetween(new Date(firstOpen), now));
