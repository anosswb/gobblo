import type { NudgeLevel, Reminder } from '@/state/schema';

/**
 * Local nudge plan (docs/01 + .claude/rules/store.md). Pure, tested.
 * - Never more than the chosen level per day: off 0 · gentle 1 · normal 2 · chaos 4.
 * - Never inside quiet hours.
 * - We only plan the next 2 days, then ONE comeback note on day 3, then silence.
 *   The plan is rebuilt every time the app opens, so an active user never gets the comeback note.
 */
export const SLOTS: Record<NudgeLevel, number[]> = {
  off: [],
  gentle: [11],
  normal: [11, 16],
  chaos: [10, 13, 16, 19],
};

export type PlannedNudge = { at: Date; kind: 'daily' | 'comeback' | 'leaving'; text: string };

export function inQuietHours(hour: number, quietStart: number, quietEnd: number): boolean {
  if (quietStart === quietEnd) return false;
  return quietStart > quietEnd ? hour >= quietStart || hour < quietEnd : hour >= quietStart && hour < quietEnd;
}

const DAILY_LINES = [
  'One tiny bite? 2 minutes, that’s all I ask.',
  'I’m hungry for one small task.',
  'Starting > finishing. Pick one bite?',
  'We’re doing ONE thing. One.',
  'Psst. 2 minutes. You + me.',
  'Your brain isn’t lazy. It’s hungry.',
];

export const COMEBACK_LINE = 'I napped. Zero guilt. One bite?';

/** Planning window for user reminders (the plan is rebuilt on every app open). */
const WINDOW_DAYS = 2;
/** A pet nudge this close to a user reminder is dropped (no double tap on the shoulder). */
const NEAR_MS = 2 * 60 * 60_000;

/**
 * When the pet should tap you for one user reminder, from `now` up to 2 days ahead.
 * One-off: its nudge time if still ahead. Daily: the same clock time every day in the window.
 */
export function reminderTimes(r: Reminder, now: Date, days = WINDOW_DAYS): Date[] {
  const lead = r.leadMin * 60_000;
  if (r.repeat !== 'daily') {
    const at = new Date(r.at - lead);
    return at > now ? [at] : [];
  }
  const first = new Date(r.at);
  const out: Date[] = [];
  for (let d = 0; d <= days; d++) {
    const occ = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, first.getHours(), first.getMinutes(), 0, 0);
    const at = new Date(occ.getTime() - lead);
    if (at > now && occ.getTime() >= r.at) out.push(at);
  }
  return out;
}

export function reminderText(r: Reminder): string {
  return r.leadMin > 0 ? `${r.leadMin} min until “${r.text}”. Wrap up the tiny thing.` : `“${r.text}”. You asked me to remind you.`;
}

/** Same calendar day (local time). */
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function planNudges(opts: {
  level: NudgeLevel;
  quietStart: number;
  quietEnd: number;
  now: Date;
  reminders?: Reminder[];
  petLine?: (i: number) => string;
}): PlannedNudge[] {
  const { level, quietStart, quietEnd, now } = opts;
  const line = opts.petLine ?? ((i: number) => DAILY_LINES[i % DAILY_LINES.length]);
  const out: PlannedNudge[] = [];

  // Reminders are asked for by the user, so they always fire, even with nudges off or in quiet
  // hours (the Reminders page warns about quiet hours). They are never in the past.
  const userTimes: Date[] = [];
  for (const r of opts.reminders ?? []) {
    for (const at of reminderTimes(r, now)) {
      userTimes.push(at);
      out.push({ at, kind: 'leaving', text: reminderText(r) });
    }
  }

  if (level === 'off') return out.sort((a, b) => +a.at - +b.at);

  // The pet's own nudges make room for the user's: on a day with reminders, the day's total stays
  // within the chosen level (reminders first), and no pet nudge lands within 2 h of a reminder.
  let n = 0;
  for (let day = 0; day < 2; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);
    const userToday = userTimes.filter((t) => sameDay(t, date));
    let room = SLOTS[level].length - userToday.length;
    for (const hour of SLOTS[level]) {
      if (room <= 0) break;
      if (inQuietHours(hour, quietStart, quietEnd)) continue;
      const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0);
      if (at <= now) continue;
      if (userTimes.some((t) => Math.abs(+t - +at) < NEAR_MS)) continue;
      out.push({ at, kind: 'daily', text: line(n++) });
      room--;
    }
  }

  const comebackHour = SLOTS[level].find((h) => !inQuietHours(h, quietStart, quietEnd));
  if (comebackHour !== undefined) {
    out.push({
      at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, comebackHour, 0, 0, 0),
      kind: 'comeback',
      text: COMEBACK_LINE,
    });
  }
  return out.sort((a, b) => +a.at - +b.at);
}
