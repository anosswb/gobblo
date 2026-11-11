import { hexToRgb } from './color';
import { palettes, PALETTES, roomGradients, stageLook } from './tokens';

const dist = (a: string, b: string) => {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};

describe('stageLook', () => {
  for (const p of PALETTES) {
    for (const scheme of ['light', 'dark'] as const) {
      it(`${p} ${scheme}: the water stands out from the box and the box carries the theme tint`, () => {
        const c = palettes[p][scheme];
        for (const sky of ['morning', 'day', 'night'] as const) {
          const l = stageLook(c, scheme, sky);
          expect(l.gradient.every((x) => /^#[0-9A-F]{6}$/i.test(x))).toBe(true);
          expect(dist(l.water, l.gradient[2])).toBeGreaterThan(20);
          expect(dist(l.crest, l.water)).toBeGreaterThan(15);
        }
      });
    }
  }

  it('time of day stays subtle', () => {
    const c = palettes.ink.light;
    expect(dist(stageLook(c, 'light', 'morning').gradient[1], stageLook(c, 'light', 'day').gradient[1])).toBeLessThan(20);
  });

  it('a Closet room keeps its own gradient', () => {
    const l = stageLook(palettes.ink.light, 'light', 'day', roomGradients.ocean);
    expect(l.gradient).toEqual([...roomGradients.ocean]);
  });
});
