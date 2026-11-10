import type { Bite } from '@/state/schema';

/** How many bites Home shows before "Show more" (2 on short screens). */
export const PLATE_LIMIT = 3;
export const PLATE_LIMIT_SHORT = 2;
export const SHORT_SCREEN_H = 700;

export const plateLimit = (windowHeight: number) => (windowHeight < SHORT_SCREEN_H ? PLATE_LIMIT_SHORT : PLATE_LIMIT);

/**
 * Which bites of today's plate Home shows. `list` is already in plate order (features/bites/logic
 * `plate`), and that order is kept.
 * - Up to limit + 1 bites: all shown (never a "Show 1 more" row).
 * - Otherwise the first `limit`, except a bite with a time (`at`) is never hidden: it takes the
 *   last visible slot(s), relative order kept. If there are more timed bites than slots, the
 *   timed ones fill every slot (earliest in list order first).
 * - expanded: everything.
 */
export function platePreview(list: Bite[], opts: { limit: number; expanded: boolean }): { visible: Bite[]; hiddenCount: number } {
  const limit = Math.max(1, opts.limit);
  if (opts.expanded || list.length <= limit + 1) return { visible: list, hiddenCount: 0 };
  const picked = new Set<number>();
  for (let i = 0; i < limit; i++) picked.add(i);
  const timedLater: number[] = [];
  for (let i = limit; i < list.length; i++) if (list[i].at !== undefined) timedLater.push(i);
  // drop untimed picks from the end to make room for timed bites that sat below the cut
  let drop = [...picked].filter((i) => list[i].at === undefined).sort((a, b) => b - a);
  for (const t of timedLater) {
    const d = drop.shift();
    if (d === undefined) break;
    picked.delete(d);
    picked.add(t);
  }
  const visible = list.filter((_, i) => picked.has(i));
  const hiddenCount = list.length - visible.length;
  // hiding a single bite is silly: show it
  if (hiddenCount === 1) return { visible: list, hiddenCount: 0 };
  return { visible, hiddenCount };
}
