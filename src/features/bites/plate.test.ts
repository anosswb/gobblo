import type { Bite } from '@/state/schema';

import { platePreview, plateLimit } from './plate';

const mk = (n: number, timedIdx: number[] = []): Bite[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `b${i}`,
    text: `bite ${i}`,
    size: 1,
    createdAt: 0,
    order: i,
    at: timedIdx.includes(i) ? 1000 + i : undefined,
  }));
const ids = (l: Bite[]) => l.map((b) => b.id);

describe('platePreview', () => {
  it('limit is 3, or 2 on short screens', () => {
    expect(plateLimit(800)).toBe(3);
    expect(plateLimit(699)).toBe(2);
    expect(plateLimit(700)).toBe(3);
  });
  it('shows all when length <= limit + 1', () => {
    expect(platePreview(mk(4), { limit: 3, expanded: false })).toMatchObject({ hiddenCount: 0 });
    expect(platePreview(mk(4), { limit: 3, expanded: false }).visible).toHaveLength(4);
    expect(platePreview(mk(3), { limit: 2, expanded: false }).hiddenCount).toBe(0);
  });
  it('cuts to limit and keeps order when longer', () => {
    const r = platePreview(mk(6), { limit: 3, expanded: false });
    expect(ids(r.visible)).toEqual(['b0', 'b1', 'b2']);
    expect(r.hiddenCount).toBe(3);
  });
  it('expanded shows everything', () => {
    const r = platePreview(mk(6), { limit: 3, expanded: true });
    expect(r.visible).toHaveLength(6);
    expect(r.hiddenCount).toBe(0);
  });
  it('a timed bite below the cut takes the last visible slot, order kept', () => {
    const r = platePreview(mk(6, [5]), { limit: 3, expanded: false });
    expect(ids(r.visible)).toEqual(['b0', 'b1', 'b5']);
    expect(r.hiddenCount).toBe(3);
  });
  it('already visible timed bites are not displaced', () => {
    const r = platePreview(mk(7, [0, 6]), { limit: 3, expanded: false });
    expect(ids(r.visible)).toEqual(['b0', 'b1', 'b6']);
  });
  it('several timed bites take several slots', () => {
    const r = platePreview(mk(7, [4, 6]), { limit: 3, expanded: false });
    expect(ids(r.visible)).toEqual(['b0', 'b4', 'b6']);
  });
  it('more timed bites than slots: all slots go to timed ones', () => {
    const r = platePreview(mk(8, [4, 5, 6, 7]), { limit: 3, expanded: false });
    expect(ids(r.visible)).toEqual(['b4', 'b5', 'b6']);
    expect(r.hiddenCount).toBe(5);
  });
  it('never leaves exactly one hidden', () => {
    const r = platePreview(mk(5, [4]), { limit: 3, expanded: false });
    expect(r.hiddenCount === 0 || r.hiddenCount > 1).toBe(true);
  });
});
