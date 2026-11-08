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
const MESSAGE = ['text', 'reply', 'call', 'email', 'mail', 'dm', 'message', 'appeler', 'répondre', 'envoyer', 'texto', 'sms'];
const TINY = ['pay', 'book', 'order', 'water', 'send', 'sign', 'check', 'cancel', 'feed', 'take out', 'trash', 'pills', 'meds', 'payer', 'arroser', 'sortir la poubelle', 'poubelle'];
const BIG = [
  'essay', 'project', 'report', 'taxes', 'thesis', 'presentation', 'study', 'homework', 'deep clean', 'whole', 'apply', 'application',
  'resume', 'cv', 'move', 'exam', 'assignment', 'révision', 'révisions', 'réviser', 'examen', 'partiel', 'dissertation', 'dissert',
  'mémoire', 'exposé', 'devoirs', 'étudier', 'projet', 'rapport', 'impôts',
];
const MEDIUM = [
  'clean', 'laundry', 'cook', 'groceries', 'grocery', 'shop', 'workout', 'gym', 'run', 'dishes', 'read', 'write', 'tidy', 'wash', 'vacuum',
  'pack', 'practice', 'shower', 'lessive', 'linge', 'ménage', 'ranger', 'nettoyer', 'vaisselle', 'courses', 'cuisiner', 'sport', 'douche',
];

const has = (s: string, words: string[]) => words.some((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(s));

export function guessSize(text: string): Size {
  const s = text.toLowerCase();
  // a quick action up front wins ("email my prof about the essay" is a message, not an essay)
  const first = (words: string[]) => words.some((w) => s.startsWith(`${w} `) || s === w);
  if (first(MESSAGE)) return 1;
  if (first(TINY)) return 0;
  if (has(s, BIG)) return 3;
  if (has(s, MESSAGE)) return 1;
  if (has(s, TINY)) return 0;
  if (has(s, MEDIUM)) return 2;
  return 1;
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
