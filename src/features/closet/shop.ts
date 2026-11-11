import { LEVELS } from '@/features/progress/logic';

import { COLORS, FACES, HATS, isUnlocked, ROOMS, type Item, type Slot } from './items';

/**
 * The spark shop (docs/16 point 11a, DECISIONS 2026-11-11): every locked Closet item can be
 * bought ONE AT A TIME with sparks, on both platforms. ALL PRICES LIVE HERE so the owner can tune them.
 *
 * Earning today (features/bites/logic + features/progress LEVELS comment): +1 ✦ for starting,
 * +1/2/3/5 ✦ for a fed tiny/small/medium/big bite, about 8 ✦ on a normal day. Android videos
 * add +15 ✦ each (config/ads.ts, max 3 a day). So without videos:
 * - 20–25 ✦ ≈ 2–3 days  → the cheapest tier: something new every few days
 * - 40–60 ✦ ≈ 5–7 days  → Plus-only items, one by one
 * - Plus (150 ✦ on Android, money on iPhone) ≈ 19 days and holds all 9 Plus items
 *   (~430 ✦ singly), the lock-screen timer and routine packs: the bundle stays far cheaper.
 * Spending sparks never lowers the level (only stats.sparks goes down, never stats.total).
 */
export const SHOP_PRICES = {
  /**
   * a level item bought before its level: base + step × levels still to go, capped (20–60 ✦).
   * Only sold while the price is below the sparks still needed for that level: otherwise just
   * feeding gets it free sooner, and we never sell what waiting gives faster.
   */
  levelEarly: { base: 15, step: 5, max: 60 },
  /** Plus items one by one (Plus still unlocks them all at once) */
  plusItem: { hat: 50, face: 40, color: 40, room: 60 } satisfies Record<Slot, number>,
  /** the weekly surprise you can already see in the Closet ("in 3 days"), a few days early */
  weeklyEarly: 25,
} as const;

/** Level 20 "Legend" items are only ever earned, never bought (DECISIONS 2026-11-07). */
export const EARNED_ONLY_LEVEL = 20;

export const ALL_ITEMS: Item[] = [...HATS, ...FACES, ...COLORS, ...ROOMS];

/** What the shop needs to know about the person. */
export interface ShopCtx {
  level: number;
  /** all-time sparks (stats.total): how far the next levels are */
  total: number;
  plus: boolean;
  /** pet week now (features/weekly petWeek) */
  week: number;
  /** pet.owned: single items bought with sparks, stored as ownKey(item) */
  owned: readonly string[];
}

/** Ids repeat across slots ('none'), so an owned item is saved as "slot:id" in pet.owned. */
export const ownKey = (item: Pick<Item, 'slot' | 'id'>) => `${item.slot}:${item.id}`;

/** Yours to wear: unlocked the usual way (free, level, week, Plus) or bought with sparks. */
export function itemOpen(item: Item, ctx: ShopCtx): boolean {
  return isUnlocked(item.unlock, ctx.level, ctx.plus, ctx.week) || ctx.owned.includes(ownKey(item));
}

/** Spark price of a locked item, or null when it is already yours or not for sale. */
export function priceOf(item: Item, ctx: ShopCtx): number | null {
  if (itemOpen(item, ctx)) return null;
  const u = item.unlock;
  if (u.type === 'level') {
    if (u.level >= EARNED_ONLY_LEVEL) return null;
    const { base, step, max } = SHOP_PRICES.levelEarly;
    const price = Math.min(max, base + step * Math.max(1, u.level - ctx.level));
    const toGo = (LEVELS[u.level - 1] ?? Infinity) - ctx.total;
    return price < toGo ? price : null;
  }
  if (u.type === 'pack') return SHOP_PRICES.plusItem[item.slot];
  // weekly: past drops are already free (nothing is ever lost); only the next one, shown in the
  // Closet with its "in N days" badge, can be had early. Later drops stay a surprise.
  if (u.type === 'week') return u.week === ctx.week + 1 ? SHOP_PRICES.weeklyEarly : null;
  return null;
}

/** Everything sparks can buy one by one right now. */
export const shopItems = (ctx: ShopCtx) => ALL_ITEMS.filter((i) => priceOf(i, ctx) !== null);

/**
 * Is there anything sparks can still buy? Controls the optional video offer: never offer
 * sparks that buy nothing. `plusForSparks` = Plus itself is sold for sparks here (Android).
 */
export function anythingToBuy(ctx: ShopCtx, plusForSparks: boolean): boolean {
  return (plusForSparks && !ctx.plus) || shopItems(ctx).length > 0;
}

export type BuyResult =
  | { ok: true; sparks: number; owned: string[]; price: number }
  | { ok: false; reason: 'owned' | 'not-for-sale' }
  | { ok: false; reason: 'short'; short: number; price: number };

/** Buy one item with spendable sparks. Pure: the caller saves the result. */
export function buy(item: Item, ctx: ShopCtx, sparks: number): BuyResult {
  if (itemOpen(item, ctx)) return { ok: false, reason: 'owned' };
  const price = priceOf(item, ctx);
  if (price === null) return { ok: false, reason: 'not-for-sale' };
  if (sparks < price) return { ok: false, reason: 'short', short: price - sparks, price };
  return { ok: true, sparks: sparks - price, owned: [...ctx.owned, ownKey(item)], price };
}
