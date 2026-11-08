/**
 * Wall-clock timer (docs/04): we store times, never count ticks, so the timer stays right
 * when the app is in the background or killed. All functions are pure.
 */
export type TimerState = {
  startedAt: number;
  endsAt: number;
  /** set while paused: ms that were left at pause time */
  pausedRemaining: number | null;
  totalMs: number;
};

export const MIN = 60_000;

export function startTimer(now: number, minutes: number): TimerState {
  const totalMs = Math.round(minutes * MIN);
  return { startedAt: now, endsAt: now + totalMs, pausedRemaining: null, totalMs };
}

export function remainingMs(t: TimerState, now: number): number {
  return Math.max(0, t.pausedRemaining ?? t.endsAt - now);
}

/** 1 → just started, 0 → done. */
export function progressLeft(t: TimerState, now: number): number {
  return t.totalMs ? remainingMs(t, now) / t.totalMs : 0;
}

export function pauseTimer(t: TimerState, now: number): TimerState {
  return t.pausedRemaining !== null ? t : { ...t, pausedRemaining: remainingMs(t, now) };
}

export function resumeTimer(t: TimerState, now: number): TimerState {
  return t.pausedRemaining === null ? t : { ...t, endsAt: now + t.pausedRemaining, pausedRemaining: null };
}

export function addMinutes(t: TimerState, minutes: number): TimerState {
  const ms = minutes * MIN;
  return t.pausedRemaining !== null
    ? { ...t, pausedRemaining: t.pausedRemaining + ms, totalMs: t.totalMs + ms }
    : { ...t, endsAt: t.endsAt + ms, totalMs: t.totalMs + ms };
}

/** Back to the full time, running (Anass: "mom came in, start the 5 minutes again"). */
export function restartTimer(t: TimerState, now: number): TimerState {
  return { startedAt: now, endsAt: now + t.totalMs, pausedRemaining: null, totalMs: t.totalMs };
}

export function spentMinutes(t: TimerState, now: number): number {
  return Math.max(0, (t.totalMs - remainingMs(t, now)) / MIN);
}

export function formatClock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** "ends at 9:41 pm" (fights time blindness). */
export function formatEndsAt(endsAt: number, clock24h: boolean): string {
  const d = new Date(endsAt);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  if (clock24h) return `${String(h).padStart(2, '0')}:${m}`;
  return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

/** 2-minute warning fires once when this many ms are left (sessions longer than 4 min). */
export const WARNING_MS = 2 * MIN;
export const shouldWarn = (t: TimerState) => t.totalMs > 4 * MIN;
