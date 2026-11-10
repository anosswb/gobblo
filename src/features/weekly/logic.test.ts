import type { Session } from '@/state/schema';

import { HATS, COLORS, ROOMS } from '@/features/closet/items';

import { dropForWeek, dropOpen, lastWeekRecap, petWeek, recapDue, WEEKLY_DROPS, weekOfDrop } from './logic';

// first open: Mon 2 Nov 2026, 10:00
const first = +new Date(2026, 10, 2, 10);
const at = (d: number, h = 12) => new Date(2026, 10, d, h);
const session = (endedAt: Date, done = true, spentMin = 5): Session => ({
  id: String(+endedAt),
  biteText: 'x',
  plannedMin: 2,
  spentMin,
  mode: '2min',
  startedAt: +endedAt - spentMin * 60_000,
  endedAt: +endedAt,
  done,
  drifts: 0,
});

describe('weekly surprise and recap', () => {
  it('week 1 starts on day 7, counted in pet days (4 am)', () => {
    expect(petWeek(first, at(8))).toBe(0);
    expect(petWeek(first, at(9, 3))).toBe(0); // 3 am on day 7 still belongs to day 6
    expect(petWeek(first, at(9, 5))).toBe(1);
    expect(petWeek(first, at(23))).toBe(3);
  });

  it('a new surprise each week from week 1, and all earlier ones stay open', () => {
    expect(dropForWeek(0)).toBeNull();
    expect(dropForWeek(1)).toEqual(WEEKLY_DROPS[0]);
    expect(dropForWeek(WEEKLY_DROPS.length + 1)).toBeNull();
    const [a, , , d] = WEEKLY_DROPS;
    expect(dropOpen(a.slot, a.id, 0)).toBe(false);
    expect(dropOpen(a.slot, a.id, 1)).toBe(true);
    // away for weeks: nothing lost, every past surprise is there
    expect(WEEKLY_DROPS.slice(0, 3).every((x) => dropOpen(x.slot, x.id, 3))).toBe(true);
    expect(dropOpen(d.slot, d.id, 3)).toBe(false);
    expect(dropOpen('color', 'pink', 9)).toBe(false);
  });

  it('hats, colours and rooms take turns: never the same kind two weeks in a row in the first 15 weeks', () => {
    const first15 = WEEKLY_DROPS.slice(0, 15);
    expect(first15.every((x, i) => i === 0 || x.slot !== first15[i - 1].slot)).toBe(true);
    expect(new Set(WEEKLY_DROPS.map((x) => `${x.slot}:${x.id}`)).size).toBe(WEEKLY_DROPS.length);
  });

  it('every weekly surprise is a real closet item that unlocks in its week', () => {
    const all = [...HATS, ...COLORS, ...ROOMS];
    for (const x of WEEKLY_DROPS) {
      const item = all.find((i) => i.slot === x.slot && i.id === x.id);
      expect(item?.unlock).toEqual({ type: 'week', week: weekOfDrop(x.slot, x.id) });
    }
    // and nothing in the closet claims a week the schedule does not have
    expect(all.filter((i) => i.unlock.type === 'week')).toHaveLength(WEEKLY_DROPS.length);
  });

  it('the recap counts fed bites from the week before only', () => {
    const list = [session(at(3)), session(at(8, 23), true, 10), session(at(5), false), session(at(10)), session(at(1))];
    expect(lastWeekRecap(list, first, at(10))).toEqual({ bites: 2, minutes: 15 });
    expect(lastWeekRecap([], first, at(10))).toEqual({ bites: 0, minutes: 0 });
  });

  it('the card shows once per week from week 1', () => {
    expect(recapDue(0, first, at(5))).toBe(false);
    expect(recapDue(0, first, at(10))).toBe(true);
    expect(recapDue(1, first, at(10))).toBe(false);
    expect(recapDue(1, first, at(16))).toBe(true);
  });
});
