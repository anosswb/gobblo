/** Tiny colour helpers for building theme tokens from a few seeds (no dependency). */

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0').toUpperCase();

/** `hex` at `a` opacity, as an rgba() string. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Mix `a` toward `b` by `t` (0 = a, 1 = b). Returns hex. */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return `#${toHex(x[0] + (y[0] - x[0]) * t)}${toHex(x[1] + (y[1] - x[1]) * t)}${toHex(x[2] + (y[2] - x[2]) * t)}`;
}
