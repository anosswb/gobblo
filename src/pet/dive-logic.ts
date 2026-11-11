import { FOOD } from '@/features/bites/logic';
import { levelOf } from '@/features/progress/logic';

/**
 * The happy dive after a feed (docs/18 §5), as plain numbers so it can be tested.
 * Timeline from the feed: chomp → small hop → fall under the water line (splash) → under water
 * (bubbles) → shoot back up with a second splash and the "+N ✦".
 */

/** The chomp the pet already does before the hop. */
export const CHOMP_MS = 700;
/** Hop up, then fall into the water: both `duration.fast` in src/theme/motion.ts (kept as plain numbers so this file stays testable without Reanimated). */
export const HOP_MS = 250;
export const FALL_MS = 250;
/** Under water after a normal feed. */
export const UNDER_MS = 1000;
/** Under water after a Big bite or a feed that levels up: a longer wait feels like a bigger prize. */
export const UNDER_BIG_MS = 2000;
/** Another feed while under: stay a little longer and surface once. */
export const UNDER_EXTEND_MS = 400;
/** Never more than this under water in one dive, however many feeds land. */
export const UNDER_MAX_MS = 3200;

export type FeedInfo = { won: number; big: boolean; levelUp: boolean };

export type DivePlan = {
  /** sparks won by every feed in this dive (shown once when it surfaces) */
  total: number;
  feeds: number;
  big: boolean;
  levelUp: boolean;
  /** when the chomp started */
  startAt: number;
  /** when the hop starts */
  hopAt: number;
  /** when it hits the water (splash, bubbles start) */
  diveAt: number;
  /** when it shoots back up */
  surfaceAt: number;
};

/** What a feed was worth: Big bites pay the most sparks; a level-up is crossing a level threshold. */
export function feedInfo(won: number, totalBefore: number, totalAfter: number): FeedInfo {
  return { won: Math.max(0, won), big: won >= FOOD[3].sparks, levelUp: levelOf(totalAfter) > levelOf(totalBefore) };
}

export const underMs = (big: boolean, levelUp: boolean) => (big || levelUp ? UNDER_BIG_MS : UNDER_MS);

/** True while a dive is planned and the pet has not surfaced yet (new feeds join it). */
export const diving = (plan: DivePlan | null, now: number): plan is DivePlan => !!plan && now < plan.surfaceAt;

/**
 * Add a feed. No dive running: a new one starts now. Already running (chomping, falling or under
 * water): no restart, the rewards add up and it stays a little longer, then surfaces once.
 */
export function addFeed(plan: DivePlan | null, f: FeedInfo, now: number): DivePlan {
  if (!diving(plan, now)) {
    const hopAt = now + CHOMP_MS;
    const diveAt = hopAt + HOP_MS + FALL_MS / 2;
    return { total: f.won, feeds: 1, big: f.big, levelUp: f.levelUp, startAt: now, hopAt, diveAt, surfaceAt: diveAt + underMs(f.big, f.levelUp) };
  }
  const big = plan.big || f.big;
  const levelUp = plan.levelUp || f.levelUp;
  const wanted = Math.max(plan.surfaceAt + UNDER_EXTEND_MS, plan.diveAt + underMs(big, levelUp));
  const surfaceAt = Math.max(Math.min(wanted, plan.diveAt + UNDER_MAX_MS), Math.min(plan.surfaceAt, now + UNDER_EXTEND_MS));
  return { ...plan, total: plan.total + f.won, feeds: plan.feeds + 1, big, levelUp, surfaceAt };
}
