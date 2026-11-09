import { en } from './en';
import { FAQ } from './faq.en';
import { GUIDES } from './guides.en';

const BANNED = /\b(treats?|cures?|manages? adhd|clinically|failed|missed|lost your streak)\b/i;

describe('page guides and FAQ copy', () => {
  it('every guide has 2–4 short steps', () => {
    for (const [id, steps] of Object.entries(GUIDES)) {
      expect([id, steps.length >= 2 && steps.length <= 4]).toEqual([id, true]);
      for (const s of steps) expect(s.body.length).toBeLessThan(160);
    }
  });

  it('the FAQ has 10–15 answers', () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(10);
    expect(FAQ.length).toBeLessThanOrEqual(15);
  });

  it('no medical claims or guilt words', () => {
    const all = [...Object.values(GUIDES).flat().flatMap((s) => [s.title, s.body]), ...FAQ.flatMap((f) => [f.q, f.a])];
    for (const line of all) expect([line, BANNED.test(line)]).toEqual([line, false]);
  });

  it('nothing says "coming soon": unbuilt features are hidden, not teased', () => {
    const strings: string[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === 'string') strings.push(v);
      else if (typeof v === 'function') strings.push(String((v as (...a: unknown[]) => unknown)(1, 'x', 'y')));
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk([en, GUIDES, FAQ]);
    for (const line of strings) expect([line, /coming soon|coming in the next|soon\b/i.test(line)]).toEqual([line, false]);
  });
});
