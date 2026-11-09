import type { Bite } from '@/state/schema';
import { dayKey, DAY_START_HOUR, todayKey } from '@/state/schema';

/**
 * "When" on a bite (panel #1 quit reason: no date or time on bites). Kept simple on purpose:
 * Today / Tomorrow / This week / Someday, plus an optional clock time for Today and Tomorrow.
 * - Today (no field): on the plate now.
 * - Tomorrow / This week: hidden in "Later" until their pet day (`showOn`), then on the plate.
 * - Someday: stays in "Later" until you move it.
 * A time pings once (local notification, outside the nudge cap, never in quiet hours: nudges/plan.ts).
 */
export type When = 'today' | 'tomorrow' | 'week' | 'someday';
export const WHENS: When[] = ['today', 'tomorrow', 'week', 'someday'];

const parse = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** A pet day key `days` after `key`. */
export const addDays = (key: string, days: number) => {
  const d = parse(key);
  return todayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
};

/** Last pet day of this week (Sunday if weeks start Monday, else Saturday). */
export function endOfWeekKey(now: Date, weekStartsMonday: boolean): string {
  const today = dayKey(now);
  const dow = parse(today).getDay(); // 0 Sunday
  const last = weekStartsMonday ? 0 : 6;
  return addDays(today, (last - dow + 7) % 7);
}

/** Is the bite on today's plate (not waiting in Later)? */
export function onPlate(b: Bite, today: string): boolean {
  if (!b.when) return true;
  if (b.when === 'someday') return false;
  return !!b.showOn && b.showOn <= today;
}

/** What the bite shows as now: a Tomorrow bite becomes Today once its day comes. */
export function whenOf(b: Bite, today: string): When {
  return onPlate(b, today) ? 'today' : (b.when ?? 'today');
}

/** Set when; a time only stays for Today / Tomorrow (and moves with the day). */
export function setWhen(b: Bite, when: When, now: Date, weekStartsMonday: boolean): Bite {
  const today = dayKey(now);
  const clock = b.at ? clockOf(b.at) : null;
  const next: Bite = { ...b, when: when === 'today' ? undefined : when, showOn: undefined, at: undefined };
  if (when === 'tomorrow') next.showOn = addDays(today, 1);
  if (when === 'week') next.showOn = endOfWeekKey(now, weekStartsMonday);
  if (clock !== null && (when === 'today' || when === 'tomorrow')) next.at = timeOn(next.showOn ?? today, clock);
  return next;
}

/** Minutes since midnight of a timestamp. */
export const clockOf = (at: number) => {
  const d = new Date(at);
  return d.getHours() * 60 + d.getMinutes();
};

/**
 * The moment `minutes` (since midnight) happens on pet day `key`. The pet day runs 4 am → 4 am,
 * so "1:00 am" on today's pet day is the calendar day after.
 */
export function timeOn(key: string, minutes: number): number {
  const d = parse(key);
  const h = Math.floor(minutes / 60);
  const extra = h < DAY_START_HOUR ? 1 : 0;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + extra, h, minutes % 60, 0, 0).getTime();
}

/** Add or clear the time (Today / Tomorrow only). */
export function setTime(b: Bite, minutes: number | null, now: Date): Bite {
  if (minutes === null) return { ...b, at: undefined };
  const key = b.when === 'tomorrow' && b.showOn ? b.showOn : dayKey(now);
  return { ...b, at: timeOn(key, minutes) };
}

/** Later bites, grouped and in plate order. */
export function laterGroups(bites: Bite[], today: string): { when: When; bites: Bite[] }[] {
  const later = bites.filter((b) => !onPlate(b, today)).sort((a, b) => (a.showOn ?? '9').localeCompare(b.showOn ?? '9') || a.order - b.order);
  return (['tomorrow', 'week', 'someday'] as When[])
    .map((w) => ({ when: w, bites: later.filter((b) => b.when === w) }))
    .filter((g) => g.bites.length > 0);
}

/** Bite times that should ping: still ahead and not eaten. */
export function biteTimes(bites: Bite[], now: Date): { at: Date; text: string; id: string }[] {
  return bites
    .filter((b) => b.at && b.at > now.getTime() && !(b.daily && b.doneOn === dayKey(now)))
    .map((b) => ({ at: new Date(b.at!), text: b.text, id: b.id }))
    .sort((a, b) => +a.at - +b.at);
}

/** Changes when any bite's time changes (to rebuild the nudge plan only then). */
export const biteTimesKey = (bites: Bite[]) =>
  bites
    .filter((b) => b.at)
    .map((b) => `${b.id}:${b.at}`)
    .join('|');
