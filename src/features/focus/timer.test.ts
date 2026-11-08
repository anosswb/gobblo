import { addMinutes, formatClock, formatEndsAt, MIN, pauseTimer, progressLeft, remainingMs, restartTimer, resumeTimer, spentMinutes, startTimer } from './timer';

describe('wall-clock timer', () => {
  const t0 = 1_000_000;
  it('counts from the clock, not ticks', () => {
    const t = startTimer(t0, 2);
    expect(remainingMs(t, t0 + 30_000)).toBe(90_000);
    expect(remainingMs(t, t0 + 999_999)).toBe(0);
    expect(progressLeft(t, t0 + 60_000)).toBeCloseTo(0.5);
  });
  it('pauses and resumes without losing time', () => {
    let t = startTimer(t0, 2);
    t = pauseTimer(t, t0 + 30_000);
    expect(remainingMs(t, t0 + 500_000)).toBe(90_000);
    t = resumeTimer(t, t0 + 500_000);
    expect(remainingMs(t, t0 + 510_000)).toBe(80_000);
  });
  it('adds minutes while running or paused', () => {
    const t = addMinutes(startTimer(t0, 2), 5);
    expect(remainingMs(t, t0)).toBe(7 * 60_000);
    expect(remainingMs(addMinutes(pauseTimer(t, t0), 1), t0 + 9e9)).toBe(8 * 60_000);
    expect(spentMinutes(t, t0 + 60_000)).toBeCloseTo(1);
  });
  it('restarts to the full time, running, even when paused', () => {
    const t0 = startTimer(0, 5);
    expect(remainingMs(restartTimer(t0, 60_000), 60_000)).toBe(5 * MIN);
    const paused = pauseTimer(t0, 2 * MIN);
    const r = restartTimer(paused, 3 * MIN);
    expect(r.pausedRemaining).toBeNull();
    expect(remainingMs(r, 3 * MIN)).toBe(5 * MIN);
    expect(r.endsAt).toBe(8 * MIN);
  });

  it('formats', () => {
    expect(formatClock(61_000)).toBe('1:01');
    expect(formatClock(0)).toBe('0:00');
    expect(formatEndsAt(new Date(2026, 0, 1, 21, 41).getTime(), false)).toBe('9:41 pm');
    expect(formatEndsAt(new Date(2026, 0, 1, 0, 5).getTime(), false)).toBe('12:05 am');
    expect(formatEndsAt(new Date(2026, 0, 1, 21, 41).getTime(), true)).toBe('21:41');
  });
});
