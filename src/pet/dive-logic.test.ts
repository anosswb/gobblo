import { addFeed, CHOMP_MS, diving, feedInfo, UNDER_BIG_MS, UNDER_EXTEND_MS, UNDER_MAX_MS, UNDER_MS, underMs } from './dive-logic';

const normal = { won: 2, big: false, levelUp: false };

describe('happy dive', () => {
  it('stays under 1 s for a normal feed, 2 s for Big or a level-up', () => {
    expect(UNDER_MS).toBe(1000);
    expect(UNDER_BIG_MS).toBe(2000);
    expect(underMs(false, false)).toBe(UNDER_MS);
    expect(underMs(true, false)).toBe(UNDER_BIG_MS);
    expect(underMs(false, true)).toBe(UNDER_BIG_MS);
  });

  it('a Big bite and a level-up are read from the sparks', () => {
    expect(feedInfo(5, 0, 5).big).toBe(true);
    expect(feedInfo(2, 0, 2).big).toBe(false);
    expect(feedInfo(1, 0, 1).levelUp).toBe(false);
    expect(feedInfo(2, 2, 4).levelUp).toBe(true); // level 2 at 3 sparks
  });

  it('a new dive: chomp first, then under water for the planned time', () => {
    const p = addFeed(null, normal, 10_000);
    expect(p.hopAt).toBe(10_000 + CHOMP_MS);
    expect(p.surfaceAt - p.diveAt).toBe(UNDER_MS);
    expect(p.total).toBe(2);
    expect(diving(p, p.surfaceAt - 1)).toBe(true);
    expect(diving(p, p.surfaceAt)).toBe(false);
  });

  it('feeds while under add up and extend the stay once, without restarting', () => {
    const p = addFeed(null, normal, 0);
    const q = addFeed(p, { won: 3, big: false, levelUp: false }, p.diveAt + 200);
    expect(q.total).toBe(5);
    expect(q.feeds).toBe(2);
    expect(q.diveAt).toBe(p.diveAt);
    expect(q.surfaceAt).toBe(p.surfaceAt + UNDER_EXTEND_MS);
  });

  it('a Big bite joining a normal dive gets the long stay', () => {
    const p = addFeed(null, normal, 0);
    const q = addFeed(p, { won: 5, big: true, levelUp: false }, p.diveAt + 100);
    expect(q.surfaceAt).toBe(p.diveAt + UNDER_BIG_MS);
  });

  it('never stays under longer than the cap', () => {
    let p = addFeed(null, normal, 0);
    for (let i = 0; i < 20; i++) p = addFeed(p, normal, p.diveAt + 100);
    expect(p.surfaceAt - p.diveAt).toBeLessThanOrEqual(UNDER_MAX_MS);
    expect(p.total).toBe(42);
  });

  it('a feed after it surfaced starts a fresh dive', () => {
    const p = addFeed(null, normal, 0);
    const q = addFeed(p, normal, p.surfaceAt + 10);
    expect(q.total).toBe(2);
    expect(q.startAt).toBe(p.surfaceAt + 10);
  });
});
