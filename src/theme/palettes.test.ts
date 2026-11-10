import { looksOf, PALETTES, palettes, type ColorTokens } from './tokens';

/** WCAG 2.x contrast, done by hand (no dependency). rgba() colours are composited on their backdrop. */
type RGBA = [number, number, number, number];

function parse(c: string): RGBA {
  const m = /^rgba?\(([^)]+)\)$/.exec(c);
  if (m) {
    const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
    return [Number(r), Number(g), Number(b), Number(a)];
  }
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(h)) throw new Error(`not a colour: ${c}`);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a];
}

/** Paint `top` over `under` (which may itself be translucent over `base`). */
function over(top: string, under: string, base?: string): [number, number, number] {
  const u = parse(under);
  const below = u[3] < 1 ? over(under, base ?? '#000000') : ([u[0], u[1], u[2]] as [number, number, number]);
  const [r, g, b, a] = parse(top);
  return [r * a + below[0] * (1 - a), g * a + below[1] * (1 - a), b * a + below[2] * (1 - a)];
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(fg: string, bg: string, base?: string) {
  const back = over(bg, base ?? bg, base);
  const front = over(fg, `rgb(${back.map(Math.round).join(',')})`);
  const [l1, l2] = [luminance(front), luminance(back)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

const looks: [string, ColorTokens][] = PALETTES.flatMap((p) => [
  [`${p} light`, palettes[p].light] as [string, ColorTokens],
  [`${p} dark`, palettes[p].dark] as [string, ColorTokens],
]);

describe('colour themes: 10 looks', () => {
  it('has 5 palettes × light + dark, every token filled', () => {
    expect(looks).toHaveLength(10);
    const keys = Object.keys(palettes.ink.light).sort();
    for (const [, c] of looks) {
      expect(Object.keys(c).sort()).toEqual(keys);
      for (const v of Object.values(c)) expect(() => parse(v)).not.toThrow();
    }
  });

  describe.each(looks)('%s', (_name, c) => {
    it('ink on bg ≥ 4.5', () => expect(contrast(c.ink, c.bg)).toBeGreaterThanOrEqual(4.5));
    it('ink on cardSolid ≥ 4.5', () => expect(contrast(c.ink, c.cardSolid)).toBeGreaterThanOrEqual(4.5));
    it('ink on card ≥ 4.5', () => expect(contrast(c.ink, c.card, c.bg)).toBeGreaterThanOrEqual(4.5));
    it('onPrimary on primary ≥ 4.5', () => expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5));
    it('ink2 on bg ≥ 4.5', () => expect(contrast(c.ink2, c.bg)).toBeGreaterThanOrEqual(4.5));
    it('ink3 on bg ≥ 3', () => expect(contrast(c.ink3, c.bg)).toBeGreaterThanOrEqual(3));
    // primary as a text / icon colour goes through primaryInk
    it('primaryInk on bg ≥ 4.5', () => expect(contrast(c.primaryInk, c.bg)).toBeGreaterThanOrEqual(4.5));
    it('primaryInk on cardSolid ≥ 4.5', () => expect(contrast(c.primaryInk, c.cardSolid)).toBeGreaterThanOrEqual(4.5));
    it('primaryInk on primarySoft (chips) ≥ 3', () => expect(contrast(c.primaryInk, c.primarySoft, c.cardSolid)).toBeGreaterThanOrEqual(3));
    it('onReward on reward ≥ 4.5', () => expect(contrast(c.onReward, c.reward)).toBeGreaterThanOrEqual(4.5));
  });

  it('falls back to Ink for an unknown palette', () => {
    expect(looksOf('neon')).toBe(palettes.ink);
    expect(looksOf(undefined)).toBe(palettes.ink);
    expect(looksOf('sage')).toBe(palettes.sage);
  });

  it('the contrast maths matches known values', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrast('#767676', '#FFFFFF')).toBeCloseTo(4.54, 1);
  });
});
