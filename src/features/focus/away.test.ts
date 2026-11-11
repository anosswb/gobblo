import { en } from '@/i18n/en';

import { pauseForAway, resumeFromAway } from './away';
import { MIN, pauseTimer, remainingMs, startTimer, type TimerState } from './timer';

type F = TimerState & { sit?: boolean; autoPaused?: boolean };
const apply = <T extends F>(f: T, p: Partial<F> | null): T => (p ? { ...f, ...p } : f);

describe('leaving the app during a session', () => {
  it('Sit with me pauses on leave and carries on on return, losing no time', () => {
    const s: F = { ...startTimer(0, 25), sit: true };
    const away = apply(s, pauseForAway(s, 5 * MIN));
    expect(away.autoPaused).toBe(true);
    expect(away.pausedRemaining).toBe(20 * MIN);
    expect(remainingMs(away, 60 * MIN)).toBe(20 * MIN); // an hour away: still 20 left
    const back = apply(away, resumeFromAway(away, 60 * MIN));
    expect(back.autoPaused).toBe(false);
    expect(back.pausedRemaining).toBeNull();
    expect(back.endsAt).toBe(80 * MIN);
    expect(remainingMs(back, 61 * MIN)).toBe(19 * MIN);
  });

  it('a pause by hand stays paused when you come back', () => {
    const s: F = { ...startTimer(0, 25), sit: true };
    const paused: F = { ...s, ...pauseTimer(s, 2 * MIN), autoPaused: false };
    expect(pauseForAway(paused, 3 * MIN)).toBeNull();
    expect(resumeFromAway(paused, 30 * MIN)).toBeNull();
  });

  it('bite sessions keep running while away (on purpose), old saves too', () => {
    const bite: F = startTimer(0, 15);
    expect(pauseForAway(bite, MIN)).toBeNull();
    expect(pauseForAway({ ...bite, sit: false }, MIN)).toBeNull();
    expect(resumeFromAway(bite, 2 * MIN)).toBeNull();
  });

  it('a finished session is left alone', () => {
    const s: F = { ...startTimer(0, 10), sit: true };
    expect(pauseForAway(s, 10 * MIN)).toBeNull();
  });

  it('leaving twice does not stack', () => {
    const s: F = { ...startTimer(0, 10), sit: true };
    const away = apply(s, pauseForAway(s, MIN));
    expect(pauseForAway(away, 2 * MIN)).toBeNull();
  });

  it('has a few warm welcome-back lines', () => {
    expect(en.focus.sitBack.length).toBeGreaterThanOrEqual(2);
    for (const l of en.focus.sitBack) expect(l).toMatch(/^[A-Z]/);
  });
});
