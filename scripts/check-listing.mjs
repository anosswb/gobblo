// Checks store/listing.json against the store limits and our own copy rules.
// Run: node scripts/check-listing.mjs  (exit code 1 when something is over a limit)
import { readFileSync } from 'node:fs';

const l = JSON.parse(readFileSync(new URL('../store/listing.json', import.meta.url), 'utf8'));
const limits = [
  ['appStore.name', 30], ['appStore.subtitle', 30], ['appStore.keywords', 100], ['appStore.promotionalText', 170], ['appStore.description', 4000],
  ['googlePlay.title', 30], ['googlePlay.shortDescription', 80], ['googlePlay.fullDescription', 4000],
];
const banned = /\b(treats?|cures?|clinically|manages? adhd|therapy|diagnos(e|is) your|failed|missed|lost your streak|#1|best app)\b/i;
let bad = 0;
for (const [path, max] of limits) {
  const text = path.split('.').reduce((o, k) => o[k], l);
  const n = [...text].length;
  const over = n > max;
  const word = path.endsWith('description') || path.endsWith('Description') || path.endsWith('Text') ? text.match(banned) : null;
  // "does not diagnose or treat" is the required disclaimer, not a claim
  const claim = word && !/does not diagnose or treat/i.test(text.slice(Math.max(0, word.index - 40), word.index + 40));
  if (over || claim) bad++;
  console.log(`${over || claim ? 'FAIL' : 'ok  '} ${path}: ${n}/${max}${claim ? `  banned word: "${word[0]}"` : ''}`);
}
const name = l.appStore.name.toLowerCase().split(/[^a-z]+/).filter(Boolean);
const dup = l.appStore.keywords.split(',').filter((k) => name.includes(k));
if (dup.length) { bad++; console.log(`FAIL appStore.keywords repeats words from the name: ${dup.join(', ')}`); }
if (/ /.test(l.appStore.keywords)) { bad++; console.log('FAIL appStore.keywords has spaces'); }
process.exit(bad ? 1 : 0);
