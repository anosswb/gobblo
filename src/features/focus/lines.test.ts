import { en } from '@/i18n/en';
import type { ActiveFocus } from '@/state/schema';

import { baseLine, isSitSession, isTwoMinuteStart, RIDE_MIN } from './lines';
import { addMinutes, MIN, pauseTimer, restartTimer, sessionMinutes, startTimer } from './timer';

const f = en.focus;

function session(mode: ActiveFocus['mode'], minutes: number, extra: Partial<ActiveFocus> = {}): ActiveFocus {
  return {
    biteId: null,
    biteText: 'x',
    size: 1,
    mode,
    ...startTimer(0, minutes),
    drifts: 0,
    rodeWave: false,
    warned: false,
    notificationId: null,
    ...extra,
  };
}
const plus5 = (s: ActiveFocus): ActiveFocus => ({ ...s, ...addMinutes(s, 5) });

describe('durations in words', () => {
  it('pluralises', () => {
    expect(f.minutes(1)).toBe('1 minute');
    expect(f.minutes(2)).toBe('2 minutes');
    expect(f.minutesLeft(1)).toBe('1 minute left');
    expect(f.twoDone(2)).toBe('2 minutes done. You started.');
  });
  it('session length comes from totalMs, at least 1', () => {
    expect(sessionMinutes(startTimer(0, 2))).toBe(2);
    expect(sessionMinutes(addMinutes(startTimer(0, 2), 5))).toBe(7);
    expect(sessionMinutes({ totalMs: 0 })).toBe(1);
  });
});

describe('the otter’s resting line follows the live length', () => {
  it('Sit with me: 25, then 30 after +5 (running or paused)', () => {
    const s = session('custom', 25, { sit: true });
    expect(baseLine(s, 'Mochi')).toBe('I’ll sit with you for 25 minutes.');
    expect(baseLine(plus5(s), 'Mochi')).toBe('I’ll sit with you for 30 minutes.');
    const paused = { ...s, ...pauseTimer(s, MIN) };
    expect(baseLine(plus5(paused), 'Mochi')).toBe('I’ll sit with you for 30 minutes.');
  });
  it('2-minute start: 2, then 7 after +5, and it stops being the 2-minute start', () => {
    const s = session('2min', 2);
    expect(baseLine(s, 'Mochi')).toBe('Just 2 minutes. I’m right here doing mine.');
    expect(isTwoMinuteStart(s)).toBe(true);
    const longer = plus5(s);
    expect(baseLine(longer, 'Mochi')).toBe('Just 7 minutes. I’m right here doing mine.');
    expect(isTwoMinuteStart(longer)).toBe(false);
    // restart keeps the length: still 7, still a normal session
    expect(isTwoMinuteStart({ ...longer, ...restartTimer(longer, MIN) })).toBe(false);
    // restart of a plain 2-minute start keeps its keep-going card
    expect(isTwoMinuteStart({ ...s, ...restartTimer(s, MIN) })).toBe(true);
  });
  it('after riding the wave: no 2-minute words, no second keep-going card', () => {
    const rode = session('2min', RIDE_MIN, { rodeWave: true });
    expect(baseLine(rode, 'Mochi')).toBe(f.working('Mochi'));
    expect(isTwoMinuteStart(rode)).toBe(false);
    expect(f.riding(RIDE_MIN)).toBe('Nice. Another 10 minutes, I’m here.');
  });
  it.each(['15', '25', 'custom'] as const)('bite session (%s) has no duration in its line, before or after +5', (mode) => {
    const s = session(mode, 15);
    expect(baseLine(s, 'Mochi')).toBe(f.working('Mochi'));
    expect(baseLine(plus5(s), 'Mochi')).toBe(f.working('Mochi'));
    expect(isTwoMinuteStart(plus5(s))).toBe(false);
  });
  it('old saved sessions without the sit field are bite sessions', () => {
    const old = session('custom', 10);
    delete old.sit;
    expect(isSitSession(old)).toBe(false);
    expect(isSitSession({ sit: true })).toBe(true);
  });
});
