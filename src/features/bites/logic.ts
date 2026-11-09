import type { Bite, PersistedState, Session, Size } from '@/state/schema';
import { dayKey } from '@/state/schema';
import { onPlate } from './when';

/** Food by size (docs/01). `icon` is what the UI shows (SF Symbols / Phosphor); `emoji` stays for native widgets. */
export const FOOD = [
  { emoji: '🥕', icon: 'foodTiny', label: 'Tiny', min: 2, sparks: 1 },
  { emoji: '☕️', icon: 'foodSmall', label: 'Small', min: 5, sparks: 2 },
  { emoji: '🍰', icon: 'foodMedium', label: 'Medium', min: 15, sparks: 3 },
  { emoji: '🍽️', icon: 'foodBig', label: 'Big', min: 25, sparks: 5 },
] as const;

let seq = 0;
export const newId = (now = Date.now()) => `${now.toString(36)}${(seq++).toString(36)}`;

/** Sentence case for anything the user types: "text mom" → "Text mom" (DECISIONS: sentence-case copy). */
export const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** What a new bite may carry besides text and size (the "when" chip). */
export type NewBite = { text: string; size: Size } & Partial<Pick<Bite, 'when' | 'showOn' | 'at'>>;

export function makeBite(text: string, size: Size, order: number, now = Date.now(), extra: Partial<Bite> = {}): Bite {
  return { ...extra, id: newId(now), text: capFirst(text.trim()), size, createdAt: now, order };
}

const whenFields = (i: NewBite): Partial<Bite> => {
  const out: Partial<Bite> = {};
  if (i.when) out.when = i.when;
  if (i.showOn) out.showOn = i.showOn;
  if (i.at) out.at = i.at;
  return out;
};

/**
 * Bites on today's plate: daily bites eaten today are hidden until tomorrow, and bites set to
 * Tomorrow / This week / Someday wait in "Later" (when.ts). `today = ''` lists every bite.
 */
export function plate(bites: Bite[], today = dayKey()): Bite[] {
  return bites
    .filter((b) => !(b.daily && b.doneOn === today) && (today === '' || onPlate(b, today)))
    .sort((a, b) => a.order - b.order);
}

export function addBites(state: PersistedState, items: NewBite[], now = Date.now()) {
  const kept = state.bites.filter((b) => !b.example);
  const start = kept.reduce((m, b) => Math.max(m, b.order), -1) + 1;
  const fresh = items.filter((i) => i.text.trim()).map((i, k) => makeBite(i.text, i.size, start + k, now, whenFields(i)));
  return { bites: [...kept, ...fresh], added: fresh.map((b) => b.id) };
}

/** "Do this first": the bite goes to the top of the plate. */
export function moveToTop(bites: Bite[], id: string): Bite[] {
  const min = bites.reduce((m, b) => Math.min(m, b.order), 0);
  return bites.map((b) => (b.id === id ? { ...b, order: min - 1 } : b));
}

/**
 * "Break it into steps": the steps take the big bite's place in the list (same spot, same
 * "when"), and the big bite leaves. No AI: the user types the steps (DECISIONS).
 */
export function splitBite(bites: Bite[], id: string, steps: { text: string; size: Size }[], now = Date.now()) {
  const big = bites.find((b) => b.id === id);
  const clean = steps.filter((s) => s.text.trim());
  if (!big || !clean.length) return { bites, added: [] as string[] };
  const keep: Partial<Bite> = { when: big.when, showOn: big.showOn };
  const fresh = clean.map((s, k) => makeBite(s.text, s.size, big.order + k / clean.length, now, keep));
  for (const f of fresh) {
    if (!f.when) delete f.when;
    if (!f.showOn) delete f.showOn;
  }
  return { bites: [...bites.filter((b) => b.id !== id), ...fresh], added: fresh.map((b) => b.id) };
}

export const removeBite = (bites: Bite[], id: string) => bites.filter((b) => b.id !== id);

export const toggleDaily = (bites: Bite[], id: string) =>
  bites.map((b) => (b.id === id ? { ...b, daily: !b.daily, doneOn: undefined } : b));

export function reorder(bites: Bite[], from: number, to: number): Bite[] {
  const list = plate(bites, '');
  const [moved] = list.splice(from, 1);
  if (!moved) return bites;
  list.splice(to, 0, moved);
  const order = new Map(list.map((b, i) => [b.id, i]));
  return bites.map((b) => (order.has(b.id) ? { ...b, order: order.get(b.id)! } : b));
}

export function partOfDay(d: Date): 'morning' | 'day' | 'night' {
  const h = d.getHours();
  if (h < 5 || h >= 21) return 'night';
  return h < 12 ? 'morning' : 'day';
}

/**
 * Starting is the hard part: +1 spark the moment a session starts (docs/01).
 */
export function rewardStart(state: PersistedState, twoMinute: boolean): Pick<PersistedState, 'stats'> {
  const s = state.stats;
  return { stats: { ...s, sparks: s.sparks + 1, total: s.total + 1, starts2: s.starts2 + (twoMinute ? 1 : 0) } };
}

/** Feed: the bite is eaten. Daily bites come back tomorrow, others leave the plate. */
export function feed(state: PersistedState, biteId: string, session: Session, now = new Date()) {
  const bite = state.bites.find((b) => b.id === biteId);
  const sparks = bite ? FOOD[bite.size].sparks : 1;
  const today = dayKey(now);
  const bites = bite?.daily
    ? state.bites.map((b) => (b.id === biteId ? { ...b, doneOn: today } : b))
    : state.bites.filter((b) => b.id !== biteId);
  const s = state.stats;
  const part = partOfDay(now);
  return {
    sparks,
    bites,
    sessions: [...state.sessions, session].slice(-2000),
    stats: {
      ...s,
      awayDays: 0,
      sparks: s.sparks + sparks,
      total: s.total + sparks,
      eaten: s.eaten + 1,
      todayEaten: s.todayEaten + 1,
      minutes: s.minutes + Math.max(0, Math.round(session.spentMin)),
      byPart: { ...s.byPart, [part]: s.byPart[part] + 1 },
    },
  };
}

/**
 * Runs on launch and on every foreground. A new pet day (from 4 am) resets "today" counters and
 * counts a "comeback day" (only goes up, never resets: no streak shame).
 */
export function newDayCheck(state: PersistedState, now = new Date()): Partial<PersistedState> | null {
  const today = dayKey(now);
  if (state.stats.lastVisit === today) return null;
  return {
    stats: { ...state.stats, lastVisit: today, todayEaten: 0, comebacks: state.stats.comebacks + 1, awayDays: daysAway(state.stats.lastVisit, now) },
  };
}

/** Days since the last visit (for the "i napped" comeback line). */
export function daysAway(lastVisit: string, now = new Date()): number {
  const [y, m, d] = lastVisit.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const last = new Date(y, m - 1, d).getTime();
  const [ty, tm, td] = dayKey(now).split('-').map(Number);
  const today = new Date(ty, tm - 1, td).getTime();
  return Math.max(0, Math.round((today - last) / 86_400_000));
}
