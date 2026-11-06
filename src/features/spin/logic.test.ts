import { buildSlices, MIN_SLICES, sliceAt, spinTarget } from './logic';
import type { Bite } from '@/state/schema';

const bite = (i: number): Bite => ({ id: `b${i}`, text: `Bite ${i}`, size: 1, createdAt: 0, order: i });

describe('spin', () => {
  it('pads a short plate with snacks', () => {
    const s = buildSlices([bite(1)], () => '🍪');
    expect(s).toHaveLength(MIN_SLICES);
    expect(s[0].biteId).toBe('b1');
    expect(s[1].biteId).toBeNull();
  });
  it('caps at 8 slices', () => {
    expect(buildSlices(Array.from({ length: 12 }, (_, i) => bite(i)), () => '🍪')).toHaveLength(8);
  });
  it('lands on the chosen slice', () => {
    for (const count of [4, 5, 8]) {
      for (let w = 0; w < count; w++) {
        const r = spinTarget(123, count, w, 5, Math.random());
        expect(sliceAt(r, count)).toBe(w);
        expect(r).toBeGreaterThan(123 + 360 * 4);
      }
    }
  });
});
