import { inQuietHours, planNudges, reminderText, reminderTimes, SLOTS } from './plan';

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

  it('plain reminders (lead 0) fire at the time and say so', () => {
    const now = new Date(2026, 10, 6, 9);
    const r = { id: 'p', text: 'water plants', at: +new Date(2026, 10, 6, 18, 30), leadMin: 0 };
    const plan = planNudges({ ...base, level: 'off', now, reminders: [r] });
    expect(plan).toHaveLength(1);
    expect(plan[0].at).toEqual(new Date(2026, 10, 6, 18, 30));
    expect(plan[0].text).toBe(reminderText(r));
    expect(plan[0].text).toContain('water plants');
  });

  it('daily reminders repeat at the same clock time inside the 2-day window', () => {
    const now = new Date(2026, 10, 6, 10);
    const r = { id: 'd', text: 'stretch', at: +new Date(2026, 10, 6, 9), leadMin: 0, repeat: 'daily' as const };
    const times = reminderTimes(r, now);
    // 9:00 today already passed → tomorrow and the day after
    expect(times.map((t) => t.getDate())).toEqual([7, 8]);
    expect(times.every((t) => t.getHours() === 9 && t.getMinutes() === 0)).toBe(true);
  });

  it('a daily reminder never fires before the day it was set for', () => {
    const now = new Date(2026, 10, 6, 10);
    const r = { id: 'd', text: 'bus', at: +new Date(2026, 10, 7, 8), leadMin: 10, repeat: 'daily' as const };
    expect(reminderTimes(r, now).map((t) => [t.getDate(), t.getHours(), t.getMinutes()])).toEqual([[7, 7, 50], [8, 7, 50]]);
  });

  it('past one-off reminders are dropped', () => {
    const now = new Date(2026, 10, 6, 16);
    expect(reminderTimes({ id: 'x', text: 'old', at: +new Date(2026, 10, 6, 15), leadMin: 20 }, now)).toEqual([]);
  });

  it('on a day with reminders, pet nudges shrink so the day stays within the level', () => {
    const now = new Date(2026, 10, 6, 8, 30);
    const reminders = [
      { id: 'a', text: 'call', at: +new Date(2026, 10, 6, 13, 30), leadMin: 0 },
      { id: 'b', text: 'gym', at: +new Date(2026, 10, 6, 20), leadMin: 0 },
    ];
    const plan = planNudges({ ...base, level: 'normal', now, reminders });
    const today = plan.filter((p) => p.at.getDate() === 6);
    expect(today.filter((p) => p.kind === 'leaving')).toHaveLength(2);
    expect(today.filter((p) => p.kind === 'daily')).toHaveLength(0); // normal = 2 a day, both used by reminders
    // tomorrow has no reminders: the normal 2 pet nudges
    expect(plan.filter((p) => p.at.getDate() === 7 && p.kind === 'daily')).toHaveLength(2);
  });

  it('no pet nudge lands within 2 hours of a reminder', () => {
    const now = new Date(2026, 10, 6, 8);
    const reminders = [{ id: 'a', text: 'call', at: +new Date(2026, 10, 6, 11, 30), leadMin: 0 }];
    const plan = planNudges({ ...base, level: 'chaos', now, reminders });
    const pet = plan.filter((p) => p.kind === 'daily' && p.at.getDate() === 6);
    expect(pet.every((p) => Math.abs(+p.at - reminders[0].at) >= 2 * 60 * 60_000)).toBe(true);
    expect(pet.length).toBeLessThanOrEqual(SLOTS.chaos.length - 1);
  });

  it('bite times ping within the daily cap and never in quiet hours', () => {
    const now = new Date(2026, 10, 6, 9);
    const at = (h: number, id: string) => ({ at: new Date(2026, 10, 6, h), text: id, id });
    // gentle = 1 a day: the first bite time takes the slot, the pet's own nudge steps aside
    const gentle = planNudges({ ...base, level: 'gentle', now, biteTimes: [at(17, 'a'), at(18, 'b')] });
    const today = gentle.filter((p) => p.at.getDate() === 6);
    expect(today.map((p) => p.kind)).toEqual(['bite']);
    expect(today[0].biteId).toBe('a');
    // quiet hours drop it; nudges off drop it
    expect(planNudges({ ...base, level: 'normal', now, biteTimes: [at(23, 'late')] }).some((p) => p.kind === 'bite')).toBe(false);
    expect(planNudges({ ...base, level: 'off', now, biteTimes: [at(17, 'a')] })).toEqual([]);
    // normal = 2 a day: two bite times, no pet nudge that day
    const normal = planNudges({ ...base, level: 'normal', now, biteTimes: [at(13, 'a'), at(17, 'b'), at(19, 'c')] });
    expect(normal.filter((p) => p.at.getDate() === 6).map((p) => p.biteId)).toEqual(['a', 'b']);
  });

  it('evening nudges for night owls keep the same count', () => {
    const plan = planNudges({ ...base, level: 'normal', time: 'evening', now: new Date(2026, 10, 6, 9) });
    expect(plan.filter((p) => p.kind === 'daily' && p.at.getDate() === 6).map((p) => p.at.getHours())).toEqual([18, 21]);
  });
});
