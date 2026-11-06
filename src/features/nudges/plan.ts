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
  'one tiny bite? 2 minutes, that’s all i ask.',
  'i’m hungry for one small task 🍬',
  'starting > finishing. pick one bite?',
  'we’re doing ONE thing. one.',
  'psst. 2 minutes. you + me.',
  'your brain isn’t lazy. it’s hungry.',
];

export const COMEBACK_LINE = 'i napped. zero guilt. one bite?';

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

  // "leaving soon" reminders are asked for by the user, so they ignore the level (still never in the past).
  for (const r of opts.reminders ?? []) {
    const at = new Date(r.at - r.leadMin * 60_000);
    if (at > now) out.push({ at, kind: 'leaving', text: `${r.leadMin} min until “${r.text}”. wrap up the tiny thing 🧭` });
  }

  if (level === 'off') return out.sort((a, b) => +a.at - +b.at);

  let n = 0;
  for (let day = 0; day < 2; day++) {
    for (const hour of SLOTS[level]) {
      if (inQuietHours(hour, quietStart, quietEnd)) continue;
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, 0, 0, 0);
      if (at <= now) continue;
      out.push({ at, kind: 'daily', text: line(n++) });
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
