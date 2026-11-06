import { guessSize, MAX_BITES, parseDump } from './parse';

describe('parseDump', () => {
  it('splits a messy dump into bites and strips filler', () => {
    const out = parseDump('ok so i need to email my prof about the extension, and do laundry, also call grandma back, clean my room then finish the essay, drink water lol');
    expect(out.map((b) => b.text)).toEqual([
      'Email my prof about the extension',
      'Do laundry',
      'Call grandma back',
      'Clean my room',
      'Finish the essay',
      'Drink water lol',
    ]);
  });
  it('splits on new lines, bullets and "and" before a verb', () => {
    expect(parseDump('• buy milk\n• pack bag and feed the cat').map((b) => b.text)).toEqual(['Buy milk', 'Pack bag', 'Feed the cat']);
  });
  it('keeps "and" inside a task', () => {
    expect(parseDump('salt and pepper').map((b) => b.text)).toEqual(['Salt and pepper']);
  });
  it('drops tiny fragments and duplicates, caps the count', () => {
    expect(parseDump('a, ok, laundry, Laundry')).toHaveLength(1);
    expect(parseDump(Array.from({ length: 20 }, (_, i) => `task number ${i}`).join(', '))).toHaveLength(MAX_BITES);
  });
  it('returns nothing for empty input', () => {
    expect(parseDump('   ')).toEqual([]);
  });
  it('guesses sizes by keywords', () => {
    expect(guessSize('finish the essay')).toBe(3);
    expect(guessSize('do laundry')).toBe(2);
    expect(guessSize('pay the phone bill')).toBe(1);
    expect(guessSize('drink water')).toBe(0);
  });
});
