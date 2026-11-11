import { PLUS_SPARKS } from '@/features/plus/catalog';
import { LEVELS } from '@/features/progress/logic';
import { WEEKLY_DROPS } from '@/features/weekly/logic';

import { HATS, ROOMS } from './items';
import { ALL_ITEMS, anythingToBuy, buy, EARNED_ONLY_LEVEL, itemOpen, ownKey, priceOf, SHOP_PRICES, shopItems, type ShopCtx } from './shop';

const base: ShopCtx = { level: 1, total: 0, plus: false, week: 0, owned: [] };
/** at the start of a level (its all-time sparks) */
const atLevel = (level: number): ShopCtx => ({ ...base, level, total: LEVELS[level - 1] });
const hat = (id: string) => HATS.find((h) => h.id === id)!;
const room = (id: string) => ROOMS.find((r) => r.id === id)!;

describe('spark shop prices', () => {
  it('every locked item has a price, except Legend (level 20), close levels and later weekly surprises', () => {
    for (const item of ALL_ITEMS) {
      const u = item.unlock;
      const price = priceOf(item, base);
      if (u.type === 'free') expect([item.id, price]).toEqual([item.id, null]);
      else if (u.type === 'level' && u.level >= EARNED_ONLY_LEVEL) expect([item.id, price]).toEqual([item.id, null]);
      else if (u.type === 'level' && LEVELS[u.level - 1] <= SHOP_PRICES.levelEarly.max) {
        // close levels: sold only while waiting would take longer than saving up
        if (price !== null) expect([item.id, price < LEVELS[u.level - 1]]).toEqual([item.id, true]);
      }
      else if (u.type === 'week' && u.week > base.week + 1) expect([item.id, price]).toEqual([item.id, null]);
      else expect([item.id, typeof price === 'number' && price > 0]).toEqual([item.id, true]);
    }
  });

  it('level items cost 20–60 and get cheaper as the level comes closer', () => {
    const levelPrices = ALL_ITEMS.map((i) => priceOf(i, base)).filter((p, k): p is number => p !== null && ALL_ITEMS[k].unlock.type === 'level');
    expect(Math.max(...levelPrices)).toBe(SHOP_PRICES.levelEarly.max);
    const sunset = room('sunset'); // level 9
    expect(priceOf(sunset, atLevel(8))).toBe(20);
    expect(priceOf(sunset, atLevel(1))!).toBeGreaterThan(priceOf(sunset, atLevel(6))!);
  });

  it('never sells a level item that feeding would bring sooner', () => {
    expect(priceOf(hat('party'), base)).toBeNull(); // level 2 = 3 sparks away
    const sunset = room('sunset'); // level 9 at 130
    expect(priceOf(sunset, { ...atLevel(8), total: 125 })).toBeNull(); // 5 to go < 20
  });

  it('Plus as a bundle is much cheaper than every Plus item bought singly', () => {
    const singles = ALL_ITEMS.filter((i) => i.unlock.type === 'pack').reduce((sum, i) => sum + (priceOf(i, base) ?? 0), 0);
    expect(singles).toBeGreaterThan(PLUS_SPARKS * 2);
  });

  it('a normal user (about 8 ✦ a day) always has something within about 3 days', () => {
    for (const ctx of [base, atLevel(5), atLevel(12), { ...atLevel(19), plus: true, week: 3 }]) {
      const cheapest = Math.min(...shopItems(ctx).map((i) => priceOf(i, ctx)!));
      expect(cheapest).toBeLessThanOrEqual(25);
    }
  });

  it('owned, unlocked or Plus items have no price', () => {
    expect(priceOf(hat('party'), atLevel(2))).toBeNull();
    expect(priceOf(hat('chef'), { ...base, plus: true })).toBeNull();
    expect(priceOf(hat('chef'), { ...base, owned: [ownKey(hat('chef'))] })).toBeNull();
  });
});

describe('weekly surprises', () => {
  it('past drops stay free: nothing is ever lost, nothing to buy', () => {
    const ctx = { ...base, week: 5 };
    for (const d of WEEKLY_DROPS.slice(0, 5)) {
      const item = ALL_ITEMS.find((i) => i.slot === d.slot && i.id === d.id)!;
      expect(itemOpen(item, ctx)).toBe(true);
      expect(priceOf(item, ctx)).toBeNull();
    }
  });
  it('only the next drop (already shown in the Closet) can be had early; later ones stay a surprise', () => {
    const ctx = { ...base, week: 2 };
    const next = WEEKLY_DROPS[2];
    const later = WEEKLY_DROPS[3];
    const find = (d: { slot: string; id: string }) => ALL_ITEMS.find((i) => i.slot === d.slot && i.id === d.id)!;
    expect(priceOf(find(next), ctx)).toBe(SHOP_PRICES.weeklyEarly);
    expect(priceOf(find(later), ctx)).toBeNull();
  });
});

describe('buying one item', () => {
  it('with enough sparks: spends the price and owns the item', () => {
    const r = buy(hat('chef'), base, 70);
    expect(r).toEqual({ ok: true, sparks: 70 - SHOP_PRICES.plusItem.hat, owned: ['hat:chef'], price: SHOP_PRICES.plusItem.hat });
    if (r.ok) expect(itemOpen(hat('chef'), { ...base, owned: r.owned })).toBe(true);
  });
  it('short: says how many sparks are missing, spends nothing', () => {
    expect(buy(hat('chef'), base, 30)).toEqual({ ok: false, reason: 'short', short: SHOP_PRICES.plusItem.hat - 30, price: SHOP_PRICES.plusItem.hat });
  });
  it('already owned or unlocked: nothing to buy', () => {
    expect(buy(hat('chef'), { ...base, owned: ['hat:chef'] }, 999)).toEqual({ ok: false, reason: 'owned' });
    expect(buy(hat('party'), atLevel(3), 999)).toEqual({ ok: false, reason: 'owned' });
  });
  it('Legend items are never sold', () => {
    expect(buy(hat('goldCrown'), base, 999)).toEqual({ ok: false, reason: 'not-for-sale' });
  });
  it('the result only holds spendable sparks: the level total is never part of it', () => {
    const r = buy(room('sunset'), atLevel(8), 25);
    expect(r.ok && Object.keys(r).sort()).toEqual(['ok', 'owned', 'price', 'sparks']);
  });
});

describe('anything left to buy (controls the video offer)', () => {
  it('true while items or Plus (for sparks) are left', () => {
    expect(anythingToBuy(base, true)).toBe(true);
    expect(anythingToBuy({ ...base, plus: true }, true)).toBe(true); // level items are still for sale
  });
  it('false when everything sparks can buy is yours', () => {
    const everything = { ...atLevel(20), plus: true, week: WEEKLY_DROPS.length };
    expect(shopItems(everything)).toEqual([]);
    expect(anythingToBuy(everything, true)).toBe(false);
    expect(anythingToBuy(everything, false)).toBe(false);
  });
  it('owning every single item also ends it, even without Plus or level 20', () => {
    const ctx: ShopCtx = { ...base, week: WEEKLY_DROPS.length };
    const all = { ...ctx, owned: shopItems(ctx).map(ownKey) };
    expect(anythingToBuy(all, false)).toBe(false);
    expect(anythingToBuy(all, true)).toBe(true); // Plus itself is still for sale for sparks
  });
});
