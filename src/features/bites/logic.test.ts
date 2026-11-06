import { freshState, todayKey, type Session } from '@/state/schema';

import { addBites, daysAway, feed, newDayCheck, plate, reorder, rewardStart, toggleDaily } from './logic';

const session = (over: Partial<Session> = {}): Session => ({
  id: 's', biteText: 'x', plannedMin: 2, spentMin: 3, mode: '2min', startedAt: 0, endedAt: 0, done: true, drifts: 0, ...over,
});

describe('bites', () => {
  it('adds bites after removing examples', () => {
    const s = freshState(0);
    s.bites = [{ id: 'ex', text: 'example', size: 0, example: true, createdAt: 0, order: 0 }];
    const { bites, added } = addBites(s, [{ text: ' email prof ', size: 1 }, { text: '  ', size: 0 }]);
    expect(bites.map((b) => b.text)).toEqual(['Email prof']);
    expect(added).toHaveLength(1);
  });

  it('daily bite stays after feeding, hidden today, back tomorrow', () => {
    const s = freshState(0);
    s.bites = addBites(s, [{ text: 'drink water', size: 0 }]).bites;
    s.bites = toggleDaily(s.bites, s.bites[0].id);
    const now = new Date(2026, 10, 6, 10);
    const r = feed(s, s.bites[0].id, session(), now);
    expect(r.bites).toHaveLength(1);
    expect(plate(r.bites, todayKey(now))).toHaveLength(0);
    expect(plate(r.bites, todayKey(new Date(2026, 10, 7, 9)))).toHaveLength(1);
  });

  it('normal bite leaves the plate and pays sparks by size', () => {
    const s = freshState(0);
    s.bites = addBites(s, [{ text: 'essay', size: 3 }]).bites;
    const r = feed(s, s.bites[0].id, session({ spentMin: 25 }), new Date(2026, 10, 6, 23));
    expect(r.bites).toHaveLength(0);
    expect(r.sparks).toBe(5);
    expect(r.stats.eaten).toBe(1);
    expect(r.stats.minutes).toBe(25);
    expect(r.stats.byPart.night).toBe(1);
  });

  it('start reward is +1 and counts 2-minute starts', () => {
    const r = rewardStart(freshState(0), true);
    expect(r.stats.sparks).toBe(1);
    expect(r.stats.starts2).toBe(1);
  });

  it('reorders by plate position', () => {
    const s = freshState(0);
    s.bites = addBites(s, [{ text: 'a', size: 0 }, { text: 'b', size: 0 }, { text: 'c', size: 0 }]).bites;
    expect(plate(reorder(s.bites, 2, 0), '').map((b) => b.text)).toEqual(['C', 'A', 'B']);
  });
});

describe('days', () => {
  it('new day resets today and counts a comeback day', () => {
    const s = freshState(new Date(2026, 10, 5).getTime());
    s.stats.todayEaten = 3;
    const r = newDayCheck(s, new Date(2026, 10, 6, 8));
    expect(r?.stats?.todayEaten).toBe(0);
    expect(r?.stats?.comebacks).toBe(2);
    expect(newDayCheck({ ...s, stats: r!.stats! }, new Date(2026, 10, 6, 20))).toBeNull();
  });

  it('counts days away', () => {
    expect(daysAway('2026-11-01', new Date(2026, 10, 6, 1))).toBe(5);
  });
});
