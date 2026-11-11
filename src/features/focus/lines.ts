import { en } from '@/i18n/en';
import type { ActiveFocus } from '@/state/schema';

import { MIN, sessionMinutes } from './timer';

const f = en.focus;

/** Minutes added by "Ride the wave" after a 2-minute start. */
export const RIDE_MIN = 10;

type LineFocus = Pick<ActiveFocus, 'mode' | 'totalMs' | 'rodeWave' | 'sit'>;

/** A "Sit with me" session (Toolkit). Old saves have no `sit` field: they are bite sessions. */
export const isSitSession = (s: Pick<ActiveFocus, 'sit'>) => s.sit === true;

/**
 * Still the plain 2-minute start: the "2 minutes done, keep going?" card belongs to it.
 * Once +5 made it longer it is a normal session, so the card can never show at the wrong time.
 */
export const isTwoMinuteStart = (s: LineFocus) => s.mode === '2min' && !s.rodeWave && s.totalMs <= 2 * MIN;

/**
 * The otter's resting line under the clock. Any duration comes from the live `totalMs`
 * (so +5 turns "2 minutes" into "7 minutes" right away), never from the preset that started it.
 */
export function baseLine(s: LineFocus, petName: string): string {
  const min = sessionMinutes(s);
  if (isSitSession(s)) return f.sitFor(min);
  if (s.mode === '2min' && !s.rodeWave) return f.two(min);
  return f.working(petName);
}
