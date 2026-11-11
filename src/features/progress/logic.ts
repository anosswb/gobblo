import type { Session, Stats } from '@/state/schema';
import { todayKey } from '@/state/schema';

/**
 * 20 levels from all-time sparks (Anass, 2026-11-07): the first two come almost at once (first
 * bite, first day) so the pet visibly grows right away; after that each level costs a bit more,
 * so level 20 lands after ~3–4 months of normal use (~8 sparks a day) and stays exciting.
 * LEVELS[i] = sparks needed to reach level i + 1.
 */
export const LEVELS = [
  0, 3, 10, 20, 34, 52, 74, 100, 130, 165, 205, 250, 300, 360, 430, 510, 600, 700, 810, 940,
] as const;
export const MAX_LEVEL = LEVELS.length;

/** Level 1..20 for a spark total. */
export function levelOf(total: number): number {
  let lv = 1;
  LEVELS.forEach((need, i) => {
    if (total >= need) lv = i + 1;
  });
  return lv;
}

/** Progress inside the current level (0..1, 1 at level 20) and sparks still needed. */
export function levelProgress(total: number): { level: number; progress: number; toNext: number | null } {
  const level = levelOf(total);
  if (level >= MAX_LEVEL) return { level, progress: 1, toNext: null };
  const from = LEVELS[level - 1];
  const to = LEVELS[level];
  return { level, progress: (total - from) / (to - from), toNext: to - total };
}

/**
 * Evolution forms (what the pet looks like). Level → form:
 * 1–2 tiny pup · 3–6 pebble juggler · 7–12 river rascal · 13–19 tide chaser ·
 * 20 legend (golden, the final surprise). The names are in STAGES below.
 */
export const STAGES = [
  { level: 1, at: LEVELS[0], name: 'Tiny pup' },
  { level: 3, at: LEVELS[2], name: 'Pebble juggler' },
  { level: 7, at: LEVELS[6], name: 'River rascal' },
  { level: 13, at: LEVELS[12], name: 'Tide chaser' },
  { level: 20, at: LEVELS[19], name: 'Legend' },
] as const;

export function stageOfLevel(level: number): number {
  let i = 0;
  STAGES.forEach((s, k) => {
    if (level >= s.level) i = k;
  });
  return i;
}

export const stageOf = (total: number) => stageOfLevel(levelOf(total));

/** 0..1 progress to the next evolution form, 1 at the last one. */
export function stageProgress(total: number): { stage: number; progress: number; toNext: number | null } {
  const stage = stageOf(total);
  const next = STAGES[stage + 1];
  if (!next) return { stage, progress: 1, toNext: null };
  const from = STAGES[stage].at;
  return { stage, progress: (total - from) / (next.at - from), toNext: next.at - total };
}

export type DayBucket = { key: string; label: string; bites: number; minutes: number; isToday: boolean };

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** The current week, 7 local days (week starts Monday or Sunday). Done sessions only. */
export function weekBuckets(sessions: Session[], now = new Date(), weekStartsMonday = true): DayBucket[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = start.getDay();
  const back = weekStartsMonday ? (dow + 6) % 7 : dow;
  start.setDate(start.getDate() - back);
  const today = todayKey(now);
  const days: DayBucket[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { key: todayKey(d), label: DAY_LABELS[d.getDay()], bites: 0, minutes: 0, isToday: todayKey(d) === today };
  });
  const index = new Map(days.map((d, i) => [d.key, i]));
  for (const s of sessions) {
    if (!s.done) continue;
    const i = index.get(todayKey(new Date(s.endedAt)));
    if (i === undefined) continue;
    days[i].bites += 1;
    days[i].minutes += Math.round(s.spentMin);
  }
  return days;
}

/**
 * Weekly bites meter: a gentle goal that never "breaks". It refills every week and only
 * says how many days you showed up (DECISIONS.md: no streak shame).
 */
export function weekMeter(days: DayBucket[], goal = 10) {
  const bites = days.reduce((n, d) => n + d.bites, 0);
  const daysFed = days.filter((d) => d.bites > 0).length;
  return { bites, goal, daysFed, progress: Math.min(1, bites / goal) };
}

/** Bites finished per hour of day (0..23) over all time: "your best hours". */
export function hourBuckets(sessions: Session[]): number[] {
  const out = new Array<number>(24).fill(0);
  for (const s of sessions) if (s.done) out[new Date(s.startedAt).getHours()] += 1;
  return out;
}

export function brainType(stats: Stats, petName: string): { title: string; line: string } {
  if (!stats.eaten) return { title: 'Fresh hatchling', line: `Feed ${petName} your first bite to unlock your brain type.` };
  if (stats.starts2 >= 2 && stats.starts2 >= stats.eaten * 0.5)
    return { title: '2-minute legend', line: 'You beat the start with the smallest possible step. Elite.' };
  const top = (Object.keys(stats.byPart) as (keyof Stats['byPart'])[]).sort((a, b) => stats.byPart[b] - stats.byPart[a])[0];
  if (top === 'night') return { title: 'Midnight hyperfocus goblin', line: 'Your brain boots up when the sun goes down.' };
  if (top === 'morning') return { title: 'Chaotic early bird', line: 'You get it done before your brain notices.' };
  return { title: 'Side-quest hero', line: 'You turn random afternoons into wins.' };
}
