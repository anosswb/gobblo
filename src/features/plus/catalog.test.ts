import { canShowOffer, DISPLAY_PRICE, hasPlus, PLUS_SPARKS, spendForPlus } from './catalog';

describe('plus catalog', () => {
  it('shows the offer only after 7 days', () => {
    expect(canShowOffer(0, 6 * 86_400_000)).toBe(false);
    expect(canShowOffer(0, 7 * 86_400_000)).toBe(true);
  });
  it('plus, or any old pack, means Plus', () => {
    expect(hasPlus([])).toBe(false);
    expect(hasPlus(['plus'])).toBe(true);
    expect(hasPlus(['startKit'])).toBe(true);
    expect(hasPlus(['makeItYours'])).toBe(true);
    expect(hasPlus(['focus'])).toBe(true);
    expect(hasPlus(['something-else'])).toBe(false);
  });
  it('costs 150 sparks on Android and $4.99 by default on iOS', () => {
    expect(PLUS_SPARKS).toBe(150);
    expect(DISPLAY_PRICE).toBe('$4.99');
  });
  it('spends sparks only when there are enough', () => {
    expect(spendForPlus(PLUS_SPARKS - 1)).toBeNull();
    expect(spendForPlus(PLUS_SPARKS + 5)).toBe(5);
  });
});
