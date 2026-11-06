import { chop, DUMP_EXAMPLE, guessSize } from './chop';

describe('chop', () => {
  it('splits a messy dump into clean bites', () => {
    expect(chop(DUMP_EXAMPLE).map((b) => b.text)).toEqual([
      'text mom back',
      'laundry',
      'email my prof about the essay',
      'buy oat milk',
      'clean my desk',
      'water the plant',
    ]);
  });

  it('splits "and" only before a verb', () => {
    expect(chop('salt and pepper chips').map((b) => b.text)).toEqual(['salt and pepper chips']);
    expect(chop('call grandma and book the dentist').map((b) => b.text)).toEqual(['call grandma', 'book the dentist']);
  });

  it('strips list marks and filler, drops empties and duplicates', () => {
    expect(chop('- gotta do dishes\n1. do dishes\n\n,,, ok\n• i really need to vacuum').map((b) => b.text)).toEqual([
      'do dishes',
      'vacuum',
    ]);
  });

  it('caps the count', () => {
    expect(chop(Array.from({ length: 40 }, (_, i) => `thing ${i}`).join('\n'))).toHaveLength(20);
  });

  it('guesses sizes from keywords', () => {
    expect(guessSize('text mom')).toBe(0);
    expect(guessSize('laundry')).toBe(2);
    expect(guessSize('email my prof about the essay')).toBe(0);
    expect(guessSize('write the essay intro')).toBe(3);
    expect(guessSize('buy oat milk')).toBe(1);
  });
});
