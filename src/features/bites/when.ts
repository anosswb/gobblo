import type { Bite } from '@/state/schema';
import { dayKey, DAY_START_HOUR, todayKey } from '@/state/schema';

/**
 * "When" on a bite (panel #1 quit reason: no date or time on bites). Kept simple on purpose:
 * Today / Tomorrow / This week / Someday / Pick a date, plus an optional clock time (not for
 * This week / Someday).
 * - Today (no field): on the plate now.
 * - Tomorrow / This week / a picked date: hidden in "Later" until their pet day (`showOn`), then
 *   on the plate (the pet day starts at 4 am, `dayKey`).
 * - Someday: stays in "Later" until you move it.
 * A time pings once (local notification, outside the nudge cap, never in quiet hours: nudges/plan.ts).
 */
export type When = 'today' | 'tomorrow' | 'week' | 'someday' | 'date';
export const WHENS: When[] = ['today', 'tomorrow', 'week', 'someday', 'date'];
/** Whens that can carry a clock time. */
export const timed = (w: When) => w === 'today' || w === 'tomorrow' || w === 'date';

export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** A pet day key `days` after `key`. */
export const addDays = (key: string, days: number) => {
  const d = parseKey(key);
  return todayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
};

/** Last pet day of this week (Sunday if weeks start Monday, else Saturday). */
export function endOfWeekKey(now: Date, weekStartsMonday: boolean): string {
  const today = dayKey(now);
  const dow = parseKey(today).getDay(); // 0 Sunday
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

/**
 * Set when; a time stays for Today / Tomorrow / a picked date (and moves with the day).
 * 'date' needs `day` (a pet day key); a day that is today or already gone means Today.
 */
export function setWhen(b: Bite, when: When, now: Date, weekStartsMonday: boolean, day?: string): Bite {
  const today = dayKey(now);
  if (when === 'date' && (!day || day <= today)) when = 'today';
  const clock = b.at ? clockOf(b.at) : null;
  const next: Bite = { ...b, when: when === 'today' ? undefined : when, showOn: undefined, at: undefined };
  if (when === 'tomorrow') next.showOn = addDays(today, 1);
  if (when === 'week') next.showOn = endOfWeekKey(now, weekStartsMonday);
  if (when === 'date') next.showOn = day;
  if (clock !== null && timed(when)) next.at = timeOn(next.showOn ?? today, clock);
  return next;
}

/** First pet day the date picker offers by default: the day after tomorrow. */
export const defaultPickedDay = (now: Date) => addDays(dayKey(now), 2);

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
  const d = parseKey(key);
  const h = Math.floor(minutes / 60);
  const extra = h < DAY_START_HOUR ? 1 : 0;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + extra, h, minutes % 60, 0, 0).getTime();
}

/** Add or clear the time (Today / Tomorrow / a picked date). */
export function setTime(b: Bite, minutes: number | null, now: Date): Bite {
  if (minutes === null) return { ...b, at: undefined };
  const today = dayKey(now);
  const key = (b.when === 'tomorrow' || b.when === 'date') && b.showOn && b.showOn > today ? b.showOn : today;
  return { ...b, at: timeOn(key, minutes) };
}

export type LaterGroup = {
  /** 'tomorrow' / 'week' / 'someday', or 'date' with its pet day in `day` */
  when: When;
  day?: string;
  bites: Bite[];
};

/**
 * Later bites grouped by the day they come onto the plate, soonest first: Tomorrow, then each
 * picked date (This week sits where its day falls), then Someday. A picked date that is
 * tomorrow joins Tomorrow.
 */
export function laterGroups(bites: Bite[], today: string): LaterGroup[] {
  const later = bites.filter((b) => !onPlate(b, today)).sort((a, b) => (a.showOn ?? '9').localeCompare(b.showOn ?? '9') || a.order - b.order);
  const tomorrow = addDays(today, 1);
  const groups: LaterGroup[] = [];
  const keyOf = (b: Bite) => (b.when === 'someday' ? 'someday' : b.when === 'week' ? 'week' : b.showOn === tomorrow ? 'tomorrow' : `date:${b.showOn}`);
  const byKey = new Map<string, LaterGroup>();
  for (const b of later) {
    const k = keyOf(b);
    let g = byKey.get(k);
    if (!g) {
      g = k.startsWith('date:') ? { when: 'date', day: b.showOn, bites: [] } : { when: k as When, bites: [] };
      byKey.set(k, g);
      groups.push(g);
    }
    g.bites.push(b);
  }
  // already soonest first (Someday sorts last); Tomorrow leads even if a This week bite shares its day
  return groups.sort((a, b) => Number(b.when === 'tomorrow') - Number(a.when === 'tomorrow'));
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
