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
});
