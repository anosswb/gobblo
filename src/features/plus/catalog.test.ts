import { canShowOffer, hasPack, PACKS, SHOWN_PACK_IDS, spendForPack } from './catalog';

describe('plus catalog', () => {
  it('shows the offer only after 7 days', () => {
    expect(canShowOffer(0, 6 * 86_400_000)).toBe(false);
    expect(canShowOffer(0, 7 * 86_400_000)).toBe(true);
  });
  it('plus unlocks every pack', () => {
    expect(hasPack(['plus'], 'focus')).toBe(true);
    expect(hasPack(['startKit'], 'focus')).toBe(false);
  });
  it('Start Kit unlocks fast on Android, the screen lists only built packs', () => {
    expect(PACKS.startKit.sparks).toBe(60);
    expect(SHOWN_PACK_IDS).toEqual(['startKit', 'makeItYours']);
  });
  it('spends sparks only when there are enough', () => {
    expect(spendForPack(PACKS.focus.sparks - 1, 'focus')).toBeNull();
    expect(spendForPack(PACKS.focus.sparks + 5, 'focus')).toBe(5);
  });
});
