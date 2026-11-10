import { adsLeftToday, afterAd } from './ad-reward';

describe('rewarded videos are capped per pet day', () => {
  it('counts up to the limit, then stops', () => {
    let a = afterAd(undefined, '2026-11-10', 3);
    expect(a).toEqual({ day: '2026-11-10', count: 1 });
    a = afterAd(a!, '2026-11-10', 3);
    a = afterAd(a!, '2026-11-10', 3);
    expect(adsLeftToday(a!, '2026-11-10', 3)).toBe(0);
    expect(afterAd(a!, '2026-11-10', 3)).toBeNull();
  });
  it('a new day starts fresh', () => {
    expect(adsLeftToday({ day: '2026-11-10', count: 3 }, '2026-11-11', 3)).toBe(3);
    expect(afterAd({ day: '2026-11-10', count: 3 }, '2026-11-11', 3)).toEqual({ day: '2026-11-11', count: 1 });
  });
});
