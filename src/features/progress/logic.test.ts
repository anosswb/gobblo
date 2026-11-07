import { freshState, type Session } from '@/state/schema';

import { brainType, hourBuckets, LEVELS, levelOf, levelProgress, stageOf, stageProgress, weekBuckets, weekMeter } from './logic';

const s = (end: Date, min = 5, done = true): Session => ({
  id: String(+end), biteText: 'x', plannedMin: 5, spentMin: min, mode: '15', startedAt: +end - min * 60000, endedAt: +end, done, drifts: 0,
});

describe('stages', () => {
  it('maps sparks to stages', () => {
    // level 3 (10 ✦) = lil gremlin, level 7 (74) = big chonk, 13 (300) = cosmic, 20 (940) = legend
    expect([0, 9, 10, 73, 74, 299, 300, 939, 940, 5000].map(stageOf)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(stageProgress(5000).toNext).toBeNull();
  });
  it('levels: fast at first, slower later, 20 max', () => {
    expect([0, 2, 3, 10, 20, 939, 940, 99999].map(levelOf)).toEqual([1, 1, 2, 3, 4, 19, 20, 20]);
    expect(levelProgress(15)).toEqual({ level: 3, progress: 0.5, toNext: 5 });
    expect(levelProgress(940).toNext).toBeNull();
    // each step costs at least as much as the one before (slows down)
    const steps = LEVELS.slice(1).map((v, i) => v - LEVELS[i]);
    steps.slice(1).forEach((d, i) => expect(d).toBeGreaterThanOrEqual(steps[i]));
  });
});

describe('week', () => {
  const now = new Date(2026, 10, 6, 12); // Friday
  it('buckets done sessions into a Monday week', () => {
    const days = weekBuckets([s(new Date(2026, 10, 3, 9)), s(new Date(2026, 10, 6, 10), 12), s(new Date(2026, 10, 6, 11), 1, false), s(new Date(2026, 9, 30))], now, true);
    expect(days.map((d) => d.label)).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
    expect(days[1].bites).toBe(1);
    expect(days[4]).toMatchObject({ bites: 1, minutes: 12, isToday: true });
    expect(weekMeter(days, 10)).toMatchObject({ bites: 2, daysFed: 2, progress: 0.2 });
  });
  it('supports Sunday weeks', () => {
    expect(weekBuckets([], now, false)[0].label).toBe('Su');
  });
});

describe('insights', () => {
  it('counts best hours', () => {
    expect(hourBuckets([s(new Date(2026, 10, 6, 10, 30), 5)])[10]).toBe(1);
  });
  it('picks a brain type', () => {
    const st = freshState(0).stats;
    expect(brainType(st, 'Bean').title).toBe('Fresh hatchling');
    expect(brainType({ ...st, eaten: 4, starts2: 3 }, 'Bean').title).toBe('2-minute legend');
    expect(brainType({ ...st, eaten: 4, byPart: { morning: 0, day: 1, night: 3 } }, 'Bean').title).toBe('Midnight hyperfocus goblin');
  });
});
