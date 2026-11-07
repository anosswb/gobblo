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

const INK = '#2A1533';

const FACES: Record<WidgetMood, string> = {
  happy: `<ellipse cx="80" cy="128" rx="8" ry="9.5" fill="${INK}"/><circle cx="82.8" cy="124.6" r="2.8" fill="#fff"/>
<ellipse cx="120" cy="128" rx="8" ry="9.5" fill="${INK}"/><circle cx="122.8" cy="124.6" r="2.8" fill="#fff"/>
<path d="M90 150 Q100 161 110 150" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  hungry: `<ellipse cx="80" cy="126" rx="10.5" ry="12.5" fill="${INK}"/><circle cx="84" cy="121" r="4" fill="#fff"/><circle cx="77" cy="131" r="1.8" fill="#fff"/>
<ellipse cx="120" cy="126" rx="10.5" ry="12.5" fill="${INK}"/><circle cx="124" cy="121" r="4" fill="#fff"/><circle cx="117" cy="131" r="1.8" fill="#fff"/>
<ellipse cx="100" cy="156" rx="8" ry="9" fill="${INK}"/><ellipse cx="100" cy="160" rx="5" ry="3.5" fill="#FF7FA8"/>
<path d="M112 160 Q114 170 111 175" stroke="#5AC8FA" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  sleepy: `<path d="M71 129 Q80 136 89 129" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M111 129 Q120 136 129 129" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
<ellipse cx="100" cy="153" rx="5" ry="4" fill="${INK}"/>
<text x="140" y="96" font-family="sans-serif" font-weight="700" font-size="22" fill="${INK}" opacity="0.55">z</text>`,
  focused: `<path d="M71 128 H89" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M111 128 H129" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<path d="M70 112 L88 118" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M130 112 L112 118" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<path d="M92 152 H108" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
};

/** The pet in the user's own colour (same shape as the app icon, assets/expo.icon). */
export function petSvg(color: string, mood: WidgetMood): string {
  const hi = mix(color, '#ffffff', 0.6);
  const lite = mix(color, '#ffffff', 0.22);
  const deep = mix(color, '#000000', 0.14);
  const line = mix(color, '#000000', 0.26);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="240" viewBox="0 0 200 240"><defs>
<radialGradient id="body" cx="34%" cy="24%" r="88%"><stop offset="0" stop-color="${hi}"/><stop offset="0.32" stop-color="${lite}"/><stop offset="0.72" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></radialGradient>
<radialGradient id="orb" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#F4FFC2"/><stop offset="1" stop-color="#C6F432"/></radialGradient>
<radialGradient id="limb" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="${lite}"/><stop offset="1" stop-color="${color}"/></radialGradient>
</defs>
<path d="M100 58 Q96 36 111 22" stroke="${line}" stroke-width="5" fill="none" stroke-linecap="round"/>
<circle cx="112" cy="20" r="16" fill="#C6F432" opacity="0.25"/>
<circle cx="112" cy="20" r="11" fill="url(#orb)"/><circle cx="108.5" cy="16.5" r="3.2" fill="#fff" opacity="0.9"/>
<ellipse cx="78" cy="218" rx="20" ry="10" fill="${line}"/><ellipse cx="122" cy="218" rx="20" ry="10" fill="${line}"/>
<ellipse cx="36" cy="152" rx="16" ry="11" transform="rotate(-28 36 152)" fill="url(#limb)"/>
<ellipse cx="164" cy="152" rx="16" ry="11" transform="rotate(28 164 152)" fill="url(#limb)"/>
<path d="M100 54 C146 54 170 90 170 138 C170 192 142 222 100 222 C58 222 30 192 30 138 C30 90 54 54 100 54Z" fill="url(#body)"/>
<path d="M156 112 Q166 142 157 172" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.28" stroke-linecap="round"/>
<ellipse cx="70" cy="92" rx="17" ry="30" transform="rotate(-24 70 92)" fill="#fff" opacity="0.32"/>
<ellipse cx="64" cy="78" rx="6" ry="11" transform="rotate(-24 64 78)" fill="#fff" opacity="0.85"/>
<ellipse cx="62" cy="152" rx="13" ry="7.5" fill="#FF3D7F" opacity="0.3"/><ellipse cx="138" cy="152" rx="13" ry="7.5" fill="#FF3D7F" opacity="0.3"/>
${FACES[mood]}</svg>`;
}
