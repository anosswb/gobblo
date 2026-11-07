import { biteIcon } from './bite-icon';

describe('biteIcon', () => {
  it('reads what the bite is about', () => {
    expect(biteIcon('Email my prof about the essay', 1)).toBe('mail');
    expect(biteIcon('Call grandma back', 1)).toBe('phone');
    expect(biteIcon('Text Mom back', 0)).toBe('message');
    expect(biteIcon('Do laundry', 2)).toBe('laundry');
    expect(biteIcon('Clean my room', 3)).toBe('clean');
    expect(biteIcon('Finish the essay', 3)).toBe('write');
    expect(biteIcon('Pay the phone bill', 1)).toBe('pay');
    expect(biteIcon('Pay rent', 1)).toBe('pay');
    expect(biteIcon('Drink water', 0)).toBe('drop');
    expect(biteIcon('Buy oat milk', 1)).toBe('shop');
    expect(biteIcon('Gym', 2)).toBe('gym');
    expect(biteIcon('Walk the dog', 1)).toBe('walk');
  });
  it('falls back to the size food icon', () => {
    expect(biteIcon('JJ', 0)).toBe('foodTiny');
    expect(biteIcon('something vague', 3)).toBe('foodBig');
  });
});
