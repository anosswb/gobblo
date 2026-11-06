import type { Bite, PersistedState, Session, Size } from '@/state/schema';
import { todayKey } from '@/state/schema';

/** Food by size (docs/01). v1 ships emoji; glossy food icons come with the art round. */
export const FOOD = [
  { emoji: '🍬', label: 'Tiny', min: 2, sparks: 1 },
  { emoji: '🍪', label: 'Small', min: 5, sparks: 2 },
  { emoji: '🍩', label: 'Medium', min: 15, sparks: 3 },
  { emoji: '🍕', label: 'Big', min: 25, sparks: 5 },
] as const;

let seq = 0;
export const newId = (now = Date.now()) => `${now.toString(36)}${(seq++).toString(36)}`;

/** Sentence case for anything the user types: "text mom" → "Text mom" (DECISIONS: sentence-case copy). */
export const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function makeBite(text: string, size: Size, order: number, now = Date.now()): Bite {
  return { id: newId(now), text: capFirst(text.trim()), size, createdAt: now, order };
}

/** Bites still on today's plate (daily bites eaten today are hidden until tomorrow). */
export function plate(bites: Bite[], today = todayKey()): Bite[] {
  return bites.filter((b) => !(b.daily && b.doneOn === today)).sort((a, b) => a.order - b.order);
}

export function addBites(state: PersistedState, items: { text: string; size: Size }[], now = Date.now()) {
  const kept = state.bites.filter((b) => !b.example);
  const start = kept.reduce((m, b) => Math.max(m, b.order), -1) + 1;
  const fresh = items.filter((i) => i.text.trim()).map((i, k) => makeBite(i.text, i.size, start + k, now));
  return { bites: [...kept, ...fresh], added: fresh.map((b) => b.id) };
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
  const today = todayKey(now);
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
 * Runs on launch and on every foreground. A new local day resets "today" counters and
 * counts a "comeback day" (only goes up, never resets: no streak shame).
 */
export function newDayCheck(state: PersistedState, now = new Date()): Partial<PersistedState> | null {
  const today = todayKey(now);
  if (state.stats.lastVisit === today) return null;
  return {
    stats: { ...state.stats, lastVisit: today, todayEaten: 0, comebacks: state.stats.comebacks + 1 },
  };
}

/** Days since the last visit (for the "i napped" comeback line). */
export function daysAway(lastVisit: string, now = new Date()): number {
  const [y, m, d] = lastVisit.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const last = new Date(y, m - 1, d).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((today - last) / 86_400_000));
}
