import { freshState, type Session } from '@/state/schema';

import { brainType, hourBuckets, stageOf, stageProgress, weekBuckets, weekMeter } from './logic';

const s = (end: Date, min = 5, done = true): Session => ({
  id: String(+end), biteText: 'x', plannedMin: 5, spentMin: min, mode: '15', startedAt: +end - min * 60000, endedAt: +end, done, drifts: 0,
});

describe('stages', () => {
  it('maps sparks to stages', () => {
    expect([0, 7, 8, 20, 39, 40, 999].map(stageOf)).toEqual([0, 0, 1, 2, 2, 3, 3]);
    expect(stageProgress(14)).toEqual({ stage: 1, progress: 0.5, toNext: 6 });
    expect(stageProgress(50).toNext).toBeNull();
  });
});

describe('week', () => {
  const now = new Date(2026, 10, 6, 12); // Friday
  it('buckets done sessions into a Monday week', () => {
    const days = weekBuckets([s(new Date(2026, 10, 3, 9)), s(new Date(2026, 10, 6, 10), 12), s(new Date(2026, 10, 6, 11), 1, false), s(new Date(2026, 9, 30))], now, true);
    expect(days.map((d) => d.label)).toEqual(['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']);
    expect(days[1].bites).toBe(1);
    expect(days[4]).toMatchObject({ bites: 1, minutes: 12, isToday: true });
    expect(weekMeter(days, 10)).toMatchObject({ bites: 2, daysFed: 2, progress: 0.2 });
  });
  it('supports Sunday weeks', () => {
    expect(weekBuckets([], now, false)[0].label).toBe('su');
  });
});

describe('insights', () => {
  it('counts best hours', () => {
    expect(hourBuckets([s(new Date(2026, 10, 6, 10, 30), 5)])[10]).toBe(1);
  });
  it('picks a brain type', () => {
    const st = freshState(0).stats;
    expect(brainType(st, 'Bean').title).toBe('fresh hatchling');
    expect(brainType({ ...st, eaten: 4, starts2: 3 }, 'Bean').title).toBe('2-minute legend');
    expect(brainType({ ...st, eaten: 4, byPart: { morning: 0, day: 1, night: 3 } }, 'Bean').title).toBe('midnight hyperfocus goblin');
  });
});
