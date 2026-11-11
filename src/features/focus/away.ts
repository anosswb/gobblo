import type { ActiveFocus } from '@/state/schema';

import { isSitSession } from './lines';
import { pauseTimer, remainingMs, resumeTimer } from './timer';

type AwayFocus = Pick<ActiveFocus, 'startedAt' | 'endsAt' | 'pausedRemaining' | 'totalMs' | 'sit' | 'autoPaused'>;
type AwayPatch = Pick<ActiveFocus, 'endsAt' | 'pausedRemaining' | 'autoPaused'>;

/**
 * Leaving the app (AppState 'background', not iOS's brief 'inactive'). Only Sit with me pauses:
 * the pet sits with you in the app, so the time waits (owner, 2026-11-11). A bite session keeps
 * running on purpose: the task happens off the phone (docs/01 §3, docs/04 Timer).
 * Same state as the manual pause, plus `autoPaused`. Null = nothing to change.
 */
export function pauseForAway(f: AwayFocus, now: number): AwayPatch | null {
  if (!isSitSession(f)) return null;
  if (f.pausedRemaining !== null) return null; // paused by hand: it stays that way
  if (remainingMs(f, now) === 0) return null; // already over
  const t = pauseTimer(f, now);
  return { endsAt: t.endsAt, pausedRemaining: t.pausedRemaining, autoPaused: true };
}

/** Back in the app: carry on, but only if we paused it (a manual pause stays paused). */
export function resumeFromAway(f: AwayFocus, now: number): AwayPatch | null {
  if (!f.autoPaused) return null;
  const t = resumeTimer(f, now);
  return { endsAt: t.endsAt, pausedRemaining: t.pausedRemaining, autoPaused: false };
}
