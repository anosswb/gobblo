import { addDays, parseKey } from '@/features/bites/when';
import { todayKey } from '@/state/schema';

export type DayFieldProps = {
  /** pet day key (YYYY-MM-DD) */
  day: string;
  /** earliest day you can pick (tomorrow's key) */
  min: string;
  onChange: (day: string) => void;
  /** spoken label, e.g. "Pick a date" */
  label: string;
};

/** Furthest day the calendar offers: two years ahead is plenty for a to-do list. */
export const maxDay = (min: string) => addDays(min, 730);

export const toDate = (key: string) => parseKey(key);
export const toKey = (d: Date) => todayKey(d);

/** "Fri 14 Nov" (with the year when it isn't this year). */
export function dayLabel(key: string, now = new Date()) {
  const d = parseKey(key);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : null),
  });
}
