import type { Size } from '@/state/schema';

/**
 * Brain dump → bites (docs/01 §5). Plain rules, no AI (DECISIONS: sizes are editable rules).
 * Splits on new lines, commas, ";", bullets, sentence ends, "and then" / "then" / "also" / "plus",
 * and "and" before a verb. Strips filler like "ok so", "I need to", "gotta".
 */
const BIG = /assignment|essay|project|clean (my )?room|study|taxes|apply|move|presentation|thesis|exam|organi[sz]e/i;
const MED = /laundry|dishes|gym|workout|groceries|cook|read|homework|room|desk|shower/i;
const SMALL = /email|reply|call|book|pay|buy|order|schedule|send|print/i;
const TINY = /text|drink|water|pill|vitamin|feed|charge|take out|trash|brush/i;

export const MAX_BITES = 12;

export function guessSize(s: string): Size {
  if (BIG.test(s)) return 3;
  if (MED.test(s)) return 2;
  if (TINY.test(s)) return 0;
  if (SMALL.test(s)) return 1;
  return s.length > 34 ? 2 : 1;
}

const FILLER = /^\s*(ok(ay)?\s*so|so|um+|like|i (need|have|gotta|should|must) to|i need|need to|gotta|have to|i should|i must)\s+/i;
const strip = (s: string) => s.replace(FILLER, '');

const VERBS = 'i|to|do|call|email|text|clean|finish|start|go|buy|book|pay|send|reply|study|wash|make|feed|pack|practice|cook|read|write|fix|take|drink';

export interface ParsedBite {
  text: string;
  size: Size;
}

export function parseDump(raw: string): ParsedBite[] {
  const seen = new Set<string>();
  return raw
    .replace(/\b(and then|then|also|plus)\b/gi, ',')
    .replace(new RegExp(`\\band\\b(?=\\s+(${VERBS})\\b)`, 'gi'), ',')
    .split(/[\n,;•]+|\.\s/)
    .map((s) => strip(strip(s)).replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 2)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, MAX_BITES)
    .map((text) => ({ text, size: guessSize(text) }));
}
