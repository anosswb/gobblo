import type { Session } from '@/state/schema';

import { colorForWeek, lastWeekRecap, petWeek, recapDue, WEEKLY_COLORS, weeklyColorOpen } from './logic';

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

  it('a new colour each week from week 1, and all earlier ones stay open', () => {
    expect(colorForWeek(0)).toBeNull();
    expect(colorForWeek(1)).toBe(WEEKLY_COLORS[0]);
    expect(colorForWeek(WEEKLY_COLORS.length + 1)).toBeNull();
    expect(weeklyColorOpen(WEEKLY_COLORS[0], 0)).toBe(false);
    expect(weeklyColorOpen(WEEKLY_COLORS[0], 1)).toBe(true);
    // away for weeks: nothing lost, every past colour is there
    expect(WEEKLY_COLORS.slice(0, 3).every((c) => weeklyColorOpen(c, 3))).toBe(true);
    expect(weeklyColorOpen(WEEKLY_COLORS[3], 3)).toBe(false);
    expect(weeklyColorOpen('pink', 9)).toBe(false);
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
