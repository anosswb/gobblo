import type { IconName } from '@/components/icon';

import { ICON_PATHS } from './icon-paths';

/**
 * SVG strings for Android home-screen widgets. Widgets are drawn by the launcher (RemoteViews),
 * not by React Native, so the pet and the icons are handed over as plain SVG text.
 */

type Hex = `#${string}`;

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/** Blend `a` toward `b` by t (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): Hex {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

/** A Lucide icon as an SVG string (same glyphs the app uses on Android). */
export function iconSvg(name: IconName, color: string, stroke = 2.2, filled = false): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
}

export type WidgetMood = 'happy' | 'hungry' | 'sleepy' | 'focused';

// The otter, same shapes as src/pet/pet.tsx (HEAD, BAND, BODY, NOSE, SPARK_PATH, faces). Copy the numbers if pet.tsx changes.
const INK = '#4A2E22';
const CREAM = '#FBEEDD';
const SPARK =
  'M-4.5 -15.5 A4.5 4.5 0 0 1 4.5 -15.5 C4.5 -9.5 9.5 -4.5 15.5 -4.5 A4.5 4.5 0 0 1 15.5 4.5 C9.5 4.5 4.5 9.5 4.5 15.5 A4.5 4.5 0 0 1 -4.5 15.5 C-4.5 9.5 -9.5 4.5 -15.5 4.5 A4.5 4.5 0 0 1 -15.5 -4.5 C-9.5 -4.5 -4.5 -9.5 -4.5 -15.5Z';
const W = (half: number, dip: number) => `M100 124 V127 M${100 - half} 127 Q${100 - half / 2} ${127 + dip} 100 127 Q${100 + half / 2} ${127 + dip} ${100 + half} 127`;
const line = (d: string, w: number) => `<path d="${d}" stroke="${INK}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const dots = `<ellipse cx="66" cy="110" rx="7.5" ry="8.5" fill="${INK}"/><ellipse cx="134" cy="110" rx="7.5" ry="8.5" fill="${INK}"/>`;
const big = [66, 134].map((x) => `<ellipse cx="${x}" cy="109" rx="9.5" ry="11" fill="${INK}"/><circle cx="${x + 3}" cy="105" r="3.4" fill="#fff"/><circle cx="${x - 3}" cy="113.5" r="1.5" fill="#fff"/>`).join('');

const FACES: Record<WidgetMood, string> = {
  happy: dots + line(W(12, 7), 3.6),
  hungry: big + line('M58 93 Q66 87 74 93 M126 93 Q134 87 142 93', 4) + line(W(12, 7), 3.6) + `<ellipse cx="106.5" cy="131" rx="3.8" ry="4.4" fill="#FF8FA3"/>`,
  sleepy:
    [66, 134].map((x) => line(`M${x - 9} 109 Q${x} 117 ${x + 9} 109`, 4.5)).join('') +
    line(W(7, 4.5), 3.4) +
    `<text x="150" y="40" font-family="sans-serif" font-weight="700" font-size="22" fill="#8E7CFF">z</text>`,
  focused:
    [66, 134].map((x) => line(`M${x - 8} 111 Q${x} 107 ${x + 8} 111`, 5)).join('') +
    line('M56 93 L74 99 M144 93 L126 99', 4.5) +
    line('M94 130 H106', 3.6),
};

/** The otter in the user's own colour; the pebble and cream parts never change colour. */
export function petSvg(color: string, mood: WidgetMood): string {
  const deep = mix(color, '#000000', 0.16);
  const deeper = mix(color, '#000000', 0.3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="240" viewBox="0 0 200 240"><defs><clipPath id="h"><path d="M100 34 C152 34 180 68 180 108 C180 140 150 158 100 158 C50 158 20 140 20 108 C20 68 48 34 100 34Z"/></clipPath></defs>
<path d="M138 196 C152 194 170 184 184 184 C196 185 197 200 186 206 C172 214 152 218 136 216Z" fill="${deep}"/>
<circle cx="36" cy="60" r="16" fill="${deep}"/><circle cx="37" cy="61" r="8.5" fill="${deeper}"/><circle cx="164" cy="60" r="16" fill="${deep}"/><circle cx="163" cy="61" r="8.5" fill="${deeper}"/>
<ellipse cx="78" cy="223" rx="17" ry="9" fill="${deep}"/><ellipse cx="122" cy="223" rx="17" ry="9" fill="${deep}"/>
<path d="M100 136 C136 136 152 170 152 196 C152 216 134 226 100 226 C66 226 48 216 48 196 C48 170 64 136 100 136Z" fill="${color}"/>
<ellipse cx="100" cy="196" rx="30" ry="24" fill="${CREAM}"/>
<path d="M100 34 C152 34 180 68 180 108 C180 140 150 158 100 158 C50 158 20 140 20 108 C20 68 48 34 100 34Z" fill="${color}"/>
<g clip-path="url(#h)"><path d="M0 134 C18 128 42 114 66 117 C82 119 90 125 100 125 C110 125 118 119 134 117 C158 114 182 128 200 134 V240 H0Z" fill="${CREAM}"/></g>
<path d="${SPARK}" transform="translate(100 80) scale(0.42)" fill="${CREAM}"/>
<g fill="${deep}" opacity="0.8"><circle cx="44" cy="128" r="2"/><circle cx="52" cy="126" r="2"/><circle cx="49" cy="133" r="2"/><circle cx="156" cy="128" r="2"/><circle cx="148" cy="126" r="2"/><circle cx="151" cy="133" r="2"/></g>
${FACES[mood]}<path d="M91 118 Q91 113 100 113 Q109 113 109 118 Q109 123 100 125 Q91 123 91 118Z" fill="${INK}"/>
<ellipse cx="72" cy="170" rx="13" ry="17" transform="rotate(-20 72 170)" fill="${color}"/><ellipse cx="128" cy="170" rx="13" ry="17" transform="rotate(20 128 170)" fill="${color}"/>
<g transform="translate(100 166) scale(1.15)"><path d="${SPARK}" transform="translate(0 2.4)" fill="#F0B43C"/><path d="${SPARK}" fill="#FFD166"/><path d="${SPARK}" transform="translate(-2.5 -3.5) scale(0.42)" fill="#FFE7A8"/></g>
<ellipse cx="78" cy="170" rx="9" ry="10" fill="${color}"/><ellipse cx="122" cy="170" rx="9" ry="10" fill="${color}"/>
</svg>`;
}
