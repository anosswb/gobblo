import { DRAG_SLOP, liftTarget, menuHeight, movedEnough, swipeRemoves, tabBarClearance } from './focus-logic';

describe('focus mode: moved enough to become a drag', () => {
  it('stays a hold for small wobbles', () => {
    expect(movedEnough(0, 0)).toBe(false);
    expect(movedEnough(5, 5)).toBe(false);
    expect(movedEnough(DRAG_SLOP, 0)).toBe(false);
  });
  it('becomes a drag past the slop in any direction', () => {
    expect(movedEnough(DRAG_SLOP + 1, 0)).toBe(true);
    expect(movedEnough(-9, -9)).toBe(true);
    expect(movedEnough(0, -20)).toBe(true);
  });
});

describe('focus mode: where the lifted bite sits', () => {
  const base = { h: 64, menuH: menuHeight(4), top: 60, bottom: 700 };
  it('stays put when the menu fits under it', () => {
    expect(liftTarget({ ...base, y: 200 })).toBe(200);
  });
  it('moves up just enough near the bottom', () => {
    const y = liftTarget({ ...base, y: 600 });
    expect(y + base.h + 8 + base.menuH).toBe(base.bottom);
    expect(y).toBeLessThan(600);
  });
  it('never goes above the top', () => {
    expect(liftTarget({ ...base, y: 10 })).toBe(60);
    expect(liftTarget({ ...base, y: 600, bottom: 200 })).toBe(60);
  });
  it('clears the tab bar and the home indicator', () => {
    expect(tabBarClearance(0)).toBe(16 + 62 + 8);
    expect(tabBarClearance(34)).toBe(28 + 62 + 8);
  });
});

describe('focus mode: swipe left to remove', () => {
  it('needs a real swipe or a flick', () => {
    expect(swipeRemoves(-20, 0, 300)).toBe(false);
    expect(swipeRemoves(-120, 0, 300)).toBe(true);
    expect(swipeRemoves(-30, -1200, 300)).toBe(true);
    expect(swipeRemoves(-30, -200, 300)).toBe(false);
  });
});
