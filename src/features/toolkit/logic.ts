import tipsJson from './tips.json';

/**
 * Toolkit logic (pure, tested). Tips, the unstick picker and breathing patterns.
 * Everything here is local: no network, no accounts.
 */

export type Tip = { id: number; text: string };
export const TIPS: Tip[] = tipsJson;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Whole days since 1970 for a "YYYY-MM-DD" key (UTC math, so time zones and DST don't shift it). */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86_400_000);
}

/**
 * The tip for a pet day (dayKey: turns over at 4 am). Same tip all day; the next day is always a
 * different one, and every tip shows once before any repeats (a stride that shares no factor with
 * the count walks the whole list).
 */
export function tipIndexForDay(key: string, count = TIPS.length): number {
  if (count <= 1) return 0;
  let stride = 37;
  while (gcd(stride, count) !== 1) stride++;
  const n = dayNumber(key);
  return (((n * stride) % count) + count) % count;
}

export const tipForDay = (key: string): Tip => TIPS[tipIndexForDay(key)];

/** "Unstick me": one tiny physical first step. Short, doable in under a minute, no thinking needed. */
export const UNSTICK_STEPS = [
  'Stand up. That’s it. Just stand.',
  'Put both feet on the floor and take one slow breath.',
  'Open the thing. The file, the app, the bag. Just open it.',
  'Drink a few sips of water.',
  'Put your phone face down, out of reach.',
  'Pick up one thing from the floor.',
  'Write the task in 3 words.',
  'Set a 2-minute timer and only look at the task.',
  'Move to a different chair.',
  'Put on your shoes.',
  'Clear a space the size of a notebook.',
  'Say out loud what you’re about to do.',
  'Turn on the tap. Or the lamp. Or the music.',
  'Wash your hands with cold water.',
  'Get the one tool you need: pen, laptop, sponge.',
  'Close every tab except one.',
  'Type the first word. Any word.',
  'Stretch your arms up for 5 seconds.',
  'Walk to where the task lives.',
  'Text one person: “starting now”.',
  'Pick the smallest part and do only that.',
  'Put the thing in your hand.',
  'Open the window for some fresh air.',
  'Roll your shoulders back three times.',
  'Read the first line. Only the first line.',
  'Put on one song and start before it ends.',
  'Take the lid off. Literally or not.',
  'Count down from 5 and move on 1.',
] as const;

/** Next step index: random, but never the same one twice in a row. */
export function nextStep(prev: number | null, rand: () => number = Math.random, count: number = UNSTICK_STEPS.length): number {
  if (count <= 1) return 0;
  const pick = Math.floor(rand() * (prev === null ? count : count - 1));
  return prev !== null && pick >= prev ? pick + 1 : pick;
}

export type BreathPhase = { kind: 'in' | 'hold' | 'out'; seconds: number };
export type BreathPattern = { id: 'calm' | 'box' | '478'; label: string; hint: string; phases: BreathPhase[] };

export const BREATH_PATTERNS: BreathPattern[] = [
  { id: 'calm', label: 'Calm', hint: 'In 4, out 6. Slow and easy.', phases: [{ kind: 'in', seconds: 4 }, { kind: 'out', seconds: 6 }] },
  {
    id: 'box',
    label: 'Box',
    hint: 'In 4, hold 4, out 4, hold 4.',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'hold', seconds: 4 },
      { kind: 'out', seconds: 4 },
      { kind: 'hold', seconds: 4 },
    ],
  },
  {
    id: '478',
    label: '4-7-8',
    hint: 'In 4, hold 7, out 8. Skip the hold if it feels too long.',
    phases: [
      { kind: 'in', seconds: 4 },
      { kind: 'hold', seconds: 7 },
      { kind: 'out', seconds: 8 },
    ],
  },
];

export const cycleSeconds = (p: BreathPattern) => p.phases.reduce((n, ph) => n + ph.seconds, 0);

/** The 5-4-3-2-1 grounding steps. */
export const GROUNDING = [
  { n: 5, text: 'things you can see' },
  { n: 4, text: 'things you can touch' },
  { n: 3, text: 'things you can hear' },
  { n: 2, text: 'things you can smell' },
  { n: 1, text: 'slow breath, all the way out' },
] as const;
