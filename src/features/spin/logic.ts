import type { Bite, Size } from '@/state/schema';

/** 5-minute resets that pad the wheel (docs/01 §6). Not tasks: little brain snacks. */
export const SNACKS = [
  { emoji: '💧', text: 'Chug a glass of water' },
  { emoji: '🎧', text: 'One song, full volume' },
  { emoji: '🤸', text: '10 jumping jacks' },
  { emoji: '🌤️', text: 'Step outside for 2 min' },
  { emoji: '🍎', text: 'Grab a snack' },
  { emoji: '🧺', text: 'Tidy for one song' },
] as const;

export const MAX_SLICES = 8;
export const MIN_SLICES = 4;

export interface Slice {
  key: string;
  emoji: string;
  text: string;
  size: Size;
  biteId: string | null;
}

/** Up to 8 slices from your bites, padded with snacks so the wheel always has at least 4. */
export function buildSlices(plate: Bite[], foodEmoji: (s: Size) => string): Slice[] {
  const fromBites: Slice[] = plate.slice(0, MAX_SLICES).map((b) => ({ key: b.id, emoji: foodEmoji(b.size), text: b.text, size: b.size, biteId: b.id }));
  const need = Math.max(0, MIN_SLICES - fromBites.length);
  const pad: Slice[] = SNACKS.slice(0, need).map((s, i) => ({ key: `snack${i}`, emoji: s.emoji, text: s.text, size: 0, biteId: null }));
  return [...fromBites, ...pad];
}

/**
 * Where a spin ends: at least `turns` full turns, then lands in the middle-ish of the winning
 * slice (pointer at the top). Returns the new absolute rotation in degrees.
 */
export function spinTarget(current: number, count: number, winner: number, turns = 5, jitter = 0.5): number {
  const slice = 360 / count;
  // slice i spans [i*slice, (i+1)*slice) clockwise from the top; rotating the wheel by -x brings angle x under the pointer
  const inside = slice * (0.2 + 0.6 * jitter);
  const land = 360 - (winner * slice + inside);
  const base = current - (current % 360) + 360 * turns;
  return base + land;
}

/** Which slice sits under the top pointer for a rotation (degrees). */
export function sliceAt(rotation: number, count: number): number {
  'worklet';
  const slice = 360 / count;
  const a = (((360 - (rotation % 360)) % 360) + 360) % 360;
  return Math.floor(a / slice) % count;
}
