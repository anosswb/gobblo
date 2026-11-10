import { shouldAskRating } from './logic';

const DAY = 86_400_000;
const base = { eaten: 3, firstOpen: 0, askedVersion: undefined, version: '1.0.0', now: 2 * DAY };

describe('shouldAskRating', () => {
  it('asks after 3 bites and 2 days', () => {
    expect(shouldAskRating(base)).toBe(true);
  });
  it('not before the 3rd bite', () => {
    expect(shouldAskRating({ ...base, eaten: 2 })).toBe(false);
  });
  it('not in the first two days', () => {
    expect(shouldAskRating({ ...base, now: 2 * DAY - 1 })).toBe(false);
    expect(shouldAskRating({ ...base, now: 0 })).toBe(false);
  });
  it('only once per app version', () => {
    expect(shouldAskRating({ ...base, askedVersion: '1.0.0' })).toBe(false);
    expect(shouldAskRating({ ...base, askedVersion: '0.9.0' })).toBe(true);
  });
});
