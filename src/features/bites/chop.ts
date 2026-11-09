import type { Size } from '@/state/schema';
import { capFirst } from './logic';

/**
 * Brain dump → bites (docs/01 §5). Pure, rule-based, editable (no AI in the core loop,
 * DECISIONS.md). Splits on new lines, commas, ";", "and then", "then", "also", and "and"
 * before a verb; in French on "et puis", "puis", "ensuite", "aussi", and "et" before a verb.
 * Strips filler ("i need to", "gotta", "ok so", "je dois"); guesses a size by keywords.
 */
export type Chopped = { text: string; size: Size };

const VERBS = [
  'apply', 'ask', 'book', 'buy', 'call', 'cancel', 'check', 'clean', 'clear', 'cook', 'do', 'dm', 'email', 'empty',
  'feed', 'file', 'finish', 'fix', 'go', 'grab', 'make', 'message', 'order', 'pack', 'pay', 'pick', 'plan', 'practice',
  'print', 'put', 'read', 'reply', 'return', 'review', 'schedule', 'send', 'shower', 'sign', 'sort', 'start', 'study',
  'submit', 'take', 'text', 'tidy', 'update', 'vacuum', 'walk', 'wash', 'water', 'work', 'write',
];

const FILLER = [
  'ok so', 'okay so', 'ok', 'okay', 'so', 'um', 'uh', 'like', 'and then', 'then', 'also', 'and', 'plus',
  'i really need to', 'i need to', 'need to', 'i have to', 'have to', 'i gotta', 'gotta', 'i should', 'should',
  'i must', 'must', 'remember to', 'don’t forget to', "don't forget to", 'dont forget to', 'i want to', 'try to', 'to',
  'et puis', 'puis', 'ensuite', 'aussi', 'et', 'bon', 'alors', 'il faut que je', 'faut que je', 'je dois', 'dois',
  'il faut', 'faut', 'je vais', 'penser à', 'ne pas oublier de', 'oublie pas de',
];

/** French verbs that may follow "et" ("réviser la philo et faire la fiche"); any "-er" word counts too. */
const FR_VERBS = ['faire', 'finir', 'prendre', 'lire', 'écrire', 'mettre', 'sortir', 'dire', 'voir', 'rendre', 'remplir', 'choisir', 'promener'];

/** Messages and calls: rarely 2 minutes once you open the thread, so Small (~5 min). */
const MESSAGE = ['text', 'reply', 'call', 'email', 'mail', 'dm', 'message', 'appeler', 'appelle', 'répondre', 'réponds', 'envoyer', 'texto', 'sms'];
const TINY = ['pay', 'book', 'order', 'water', 'send', 'sign', 'check', 'cancel', 'feed', 'take out', 'trash', 'pills', 'meds', 'payer', 'arroser', 'sortir la poubelle', 'poubelle', 'prendre (?:mes|un|le) médicaments?'];
/** Big jobs (~25 min or more): long writing, school, whole-house chores, admin marathons. */
const BIG = [
  'essay', 'project', 'report', 'taxes', 'thesis', 'dissertation', 'presentation', 'slides', 'deck', 'portfolio', 'research',
  'study', 'homework', 'deep clean', 'spring clean', 'clean (?:the|my|our) (?:whole )?(?:house|home|apartment|flat|garage|kitchen|bathroom|car)',
  'whole', 'apply', 'application', 'resume', 'cv', 'move', 'moving', 'exam', 'midterm', 'finals', 'assignment', 'chapter',
  'révision', 'réviser', 'examen', 'partiel', 'bac', 'dissert', 'mémoire', 'exposé', 'devoirs?', 'étudier', 'projet', 'rapport', 'impôts',
  'grand ménage', 'ménage (?:de|dans) (?:la|toute la) maison', 'nettoyer (?:la|toute la) maison', 'déménag(?:er|ement)', 'candidature', 'thèse',
];
const MEDIUM = [
  'clean', 'laundry', 'cook', 'groceries', 'grocery', 'shop', 'workout', 'gym', 'run', 'dishes', 'read', 'tidy', 'wash', 'vacuum',
  'pack', 'practice', 'shower', 'lessive', 'linge', 'ménage', 'ranger', 'nettoyer', 'vaisselle', 'courses', 'cuisiner', 'sport', 'douche', 'lire',
];
/** "Write" is long writing unless it is a note, list or message. */
const WRITE = ['write', 'écrire', 'rédiger'];
const SHORT_WRITE = ['list', 'note', 'notes', 'card', 'message', 'text', 'email', 'mail', 'reminder', 'liste', 'mot', 'carte', 'sms', 'texto'];
/** Things you count in work: "50 pages", "20 questions". */
const COUNT_UNITS = 'pages?|words?|slides?|questions?|exercises?|problems?|chapters?|emails?|flashcards?|cards?|mots|exercices?|diapos?|chapitres?|fiches?';
/** Many quick things are no longer quick: "reply to 30 emails", "pay 12 bills". */
const PILE = /(\d+)\s*(?:e-?mails?|messages?|texts?|calls?|bills?|invoices?|forms?|factures?|appels?)(?![\p{L}])/giu;
/** A number followed by one of these is money, time or a measure, not work ("pay 100 dh", "at 5 pm"). */
const NOT_WORK = /^\s*(?:dh|mad|dirhams?|\$|€|£|eur|euros?|usd|dollars?|%|g|kg|ml|l|cl|km|m|min|mins|minutes?|h|hrs?|hours?|heures?|am|pm|ans?|years?)(?![\p{L}])/iu;

const has = (s: string, words: string[]) => words.some((w) => new RegExp(`(?:^|[^\\p{L}\\p{N}])${w}(?:s|es)?(?=$|[^\\p{L}\\p{N}])`, 'iu').test(s));

/** How much a number in the text says "this is long": 2 = counted work (≥ 10 pages), 1 = a big bare number (≥ 50), 0 = none. */
function numberWeight(s: string): 0 | 1 | 2 {
  let best: 0 | 1 | 2 = 0;
  const unit = new RegExp(`(\\d+)\\s*(?:${COUNT_UNITS})(?![\\p{L}])`, 'giu');
  for (const m of s.matchAll(unit)) if (Number(m[1]) >= 10) best = 2;
  if (best) return best;
  for (const m of s.matchAll(/(?<![\d:.,])(\d+)(?![\d:.,])/g)) {
    const after = s.slice((m.index ?? 0) + m[0].length);
    if (Number(m[1]) >= 50 && Number(m[1]) < 10000 && !NOT_WORK.test(after)) best = 1;
  }
  return best;
}

export function guessSize(text: string): Size {
  const s = text.toLowerCase().trim();
  const weight = numberWeight(s);
  // a quick action up front wins ("email my prof about the essay" is a message, not an essay),
  // unless it is a pile of them ("reply to 30 emails")
  const first = (words: string[]) => words.some((w) => new RegExp(`^${w}(?:s|es)?(?=$|[^\\p{L}])`, 'iu').test(s));
  const pile = [...s.matchAll(PILE)].some((m) => Number(m[1]) >= 10);
  if (first(MESSAGE)) return pile ? 2 : 1;
  if (first(TINY)) return pile ? 2 : 0;
  if (has(s, BIG) || weight === 2) return 3;
  if (has(s, WRITE)) return has(s, SHORT_WRITE) ? 1 : 3;
  let base: Size = has(s, MESSAGE) ? 1 : has(s, TINY) ? 0 : has(s, MEDIUM) ? 2 : 1;
  if (weight === 1) base = Math.min(3, base + 1) as Size;
  return base;
}

function stripFiller(part: string): string {
  let s = part.trim().replace(/^([-*•·–—]|\d+[.)])\s*/, '');
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of FILLER) {
      const re = new RegExp(`^${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s,:]+|$)`, 'i');
      if (re.test(s)) {
        s = s.replace(re, '');
        changed = true;
      }
    }
  }
  return s.replace(/[\s.!?,;:]+$/, '').trim();
}

export function chop(input: string, max = 20): Chopped[] {
  const verbs = VERBS.join('|');
  const parts = input
    .split(/\n|;|,|\.\s|\band then\b|\bthen\b|\balso\b|\s(?:et puis|puis|ensuite|aussi)\s/i)
    .flatMap((p) => p.split(new RegExp(`\\s+and\\s+(?=(?:${verbs})\\b)`, 'i')))
    .flatMap((p) => p.split(new RegExp(`\\s+et\\s+(?=(?:${FR_VERBS.join('|')})(?![\\p{L}])|[\\p{L}]+er(?![\\p{L}]))`, 'iu')));

  const seen = new Set<string>();
  const out: Chopped[] = [];
  for (const raw of parts) {
    const text = stripFiller(raw).slice(0, 80);
    if (text.length < 2) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text: capFirst(text), size: guessSize(text) });
    if (out.length >= max) break;
  }
  return out;
}

export const DUMP_EXAMPLE = 'ok so i need to text mom back, laundry and then email my prof about the essay\nbuy oat milk; gotta clean my desk and water the plant';
