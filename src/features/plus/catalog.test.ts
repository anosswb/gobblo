import { canShowOffer, hasPack, PACKS, spendForPack } from './catalog';

describe('plus catalog', () => {
  it('shows the offer only after 7 days', () => {
    expect(canShowOffer(0, 6 * 86_400_000)).toBe(false);
    expect(canShowOffer(0, 7 * 86_400_000)).toBe(true);
  });
  it('plus unlocks every pack', () => {
    expect(hasPack(['plus'], 'focus')).toBe(true);
    expect(hasPack(['startKit'], 'focus')).toBe(false);
  });
  it('spends sparks only when there are enough', () => {
    expect(spendForPack(PACKS.focus.sparks - 1, 'focus')).toBeNull();
    expect(spendForPack(PACKS.focus.sparks + 5, 'focus')).toBe(5);
  });
});
