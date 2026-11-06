import { inQuietHours, planNudges, SLOTS } from './plan';

const base = { quietStart: 22, quietEnd: 8 };

describe('nudge plan', () => {
  it('off sends nothing', () => {
    expect(planNudges({ ...base, level: 'off', now: new Date(2026, 10, 6, 9) })).toEqual([]);
  });

  it('never exceeds the level per day, and adds one comeback on day 3', () => {
    for (const level of ['gentle', 'normal', 'chaos'] as const) {
      const plan = planNudges({ ...base, level, now: new Date(2026, 10, 6, 0, 5) });
      const perDay = new Map<number, number>();
      for (const p of plan.filter((x) => x.kind === 'daily')) perDay.set(p.at.getDate(), (perDay.get(p.at.getDate()) ?? 0) + 1);
      for (const c of perDay.values()) expect(c).toBeLessThanOrEqual(SLOTS[level].length);
      const comebacks = plan.filter((x) => x.kind === 'comeback');
      expect(comebacks).toHaveLength(1);
      expect(comebacks[0].at.getDate()).toBe(9);
    }
  });

  it('skips past slots and quiet hours', () => {
    const plan = planNudges({ level: 'chaos', quietStart: 12, quietEnd: 17, now: new Date(2026, 10, 6, 11) });
    expect(plan.every((p) => !inQuietHours(p.at.getHours(), 12, 17))).toBe(true);
    expect(plan.every((p) => p.at > new Date(2026, 10, 6, 11))).toBe(true);
  });

  it('handles quiet hours across midnight', () => {
    expect(inQuietHours(23, 22, 8)).toBe(true);
    expect(inQuietHours(7, 22, 8)).toBe(true);
    expect(inQuietHours(8, 22, 8)).toBe(false);
  });

  it('plans leaving-soon reminders before the time', () => {
    const now = new Date(2026, 10, 6, 13);
    const plan = planNudges({ ...base, level: 'off', now, reminders: [{ id: 'r', text: 'dentist', at: +new Date(2026, 10, 6, 15), leadMin: 20 }] });
    expect(plan).toHaveLength(1);
    expect(plan[0].at.getHours()).toBe(14);
    expect(plan[0].at.getMinutes()).toBe(40);
  });
});
