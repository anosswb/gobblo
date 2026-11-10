import { Platform, type TextStyle } from 'react-native';

import { alpha, mix } from './color';

/**
 * Colour tokens. Apple structure (label / secondaryLabel / tertiaryLabel inks, hairline
 * separators, opaque cards), coloured by one of 5 palettes (`palettes` below, docs/16 #1),
 * each with a designed light and dark look. Dark is near-black with a tiny tint, never fog.
 * Components must only use these tokens. No hex values in components.
 */
export type ColorTokens = {
  /** base background (behind the backdrop gradient) */
  bg: string;
  /** backdrop gradient, top → bottom, and two soft glows (src/components/backdrop.tsx) */
  bgTop: string;
  bgBottom: string;
  glowA: string;
  glowB: string;
  /** opaque card for sheets and anything that must not show through */
  cardSolid: string;
  /** hairline edge on glass cards (light catching the edge) */
  cardBorder: string;
  /** secondarySystemGroupedBackground (cards, rows) */
  card: string;
  /** tertiary surface: wells inside cards, pressed rows */
  cardAlt: string;
  /** tertiarySystemFill: input wells, segmented track */
  fill: string;
  /** secondarySystemFill: switch off-track */
  fill2: string;
  /** segmented thumb, switch knob */
  thumb: string;
  /** translucent material over content (fallback when Liquid Glass is missing) */
  glass: string;
  /** bright top edge of a glass surface (light catching the material) */
  glassBorder: string;
  /** soft outer edge so glass reads on a plain background */
  glassEdge: string;
  scrim: string;
  /** label */
  ink: string;
  /** secondaryLabel */
  ink2: string;
  /** tertiaryLabel */
  ink3: string;
  /** separator */
  line: string;
  /** the tint */
  primary: string;
  primaryDeep: string;
  /** primary used as text or an icon colour (a darker shade when primary is a pastel) */
  primaryInk: string;
  /** tint at ~12 %: selected rows, soft buttons */
  primarySoft: string;
  onPrimary: string;
  reward: string;
  rewardDeep: string;
  onReward: string;
  success: string;
  sun: string;
  pink: string;
  danger: string;
  shadow: string;
  tabBar: string;
  focusTop: string;
  focusMid: string;
  focusBottom: string;
  /** text and glass on the focus room (same in both themes) */
  onFocus: string;
  onFocus2: string;
  focusGlass: string;
  focusScrim: string;
  /** text on a light Closet room (sunset, ocean…): those scenes stay light in dark mode too */
  onLightScene: string;
  /** the focus timer room: follows the theme (Anass 2026-11-08: dark timer in light mode looked broken) */
  roomTop: string;
  roomMid: string;
  roomBottom: string;
  roomInk: string;
  roomInk2: string;
  roomGlass: string;
  /** dark theme: dims bright scenes */
  sceneDim: string;
  /** glyph on an iOS Settings icon tile (always white) */
  onTile: string;
  /** switch knob (always white, like iOS) */
  knob: string;
};

const shared = {
  sun: '#FFCC00',
  // Focus room: neutral night (premium, no purple)
  focusTop: '#1C1C1F',
  focusMid: '#111113',
  focusBottom: '#050506',
  onFocus: '#FFFFFF',
  onFocus2: 'rgba(235,235,245,0.6)',
  focusGlass: 'rgba(255,255,255,0.08)',
  focusScrim: 'rgba(5,5,6,0.55)',
  onLightScene: '#0B0B0D',
  sceneDim: 'rgba(0,0,0,0.18)',
  onTile: '#FFFFFF',
  knob: '#FFFFFF',
} as const;

/** Colour themes (docs/16 #1): 5 palettes × light + dark = 10 looks. All free. */
export type Palette = 'ink' | 'blush' | 'cotton' | 'sage' | 'graphite';
export const PALETTES: readonly Palette[] = ['ink', 'blush', 'cotton', 'sage', 'graphite'];

/** The few colours a look is built from; everything else is derived in `makeLook`. */
type Seed = {
  bg: string;
  /** cards and rows (opaque) */
  card: string;
  ink: string;
  primary: string;
  onPrimary: string;
  /** primary as text / icon colour; defaults to `primary` (pastel primaries need a darker shade) */
  primaryInk?: string;
  /** soft tint for chips, selected rows, soft buttons; defaults to primary at low opacity */
  soft?: string;
};

const WHITE = '#FFFFFF';
const BLACK = '#000000';

function makeLook(scheme: 'light' | 'dark', s: Seed): ColorTokens {
  const isDark = scheme === 'dark';
  const primaryInk = s.primaryInk ?? s.primary;
  const status = isDark
    ? { success: '#30D158', pink: '#FF6FA8', danger: '#FF453A' }
    : { success: '#34C759', pink: '#FF4F96', danger: '#FF3B30' };
  return {
    ...shared,
    ...status,
    // backdrop: a very soft vertical tone (nearly flat in dark), no glows
    bg: s.bg,
    bgTop: isDark ? mix(s.bg, s.ink, 0.025) : mix(s.bg, WHITE, 0.6),
    bgBottom: isDark ? mix(s.bg, BLACK, 0.4) : mix(s.bg, s.ink, 0.03),
    glowA: isDark ? alpha(s.ink, 0.05) : alpha(WHITE, 0.9),
    glowB: alpha(WHITE, 0),
    card: s.card,
    cardSolid: s.card,
    cardBorder: alpha(s.ink, isDark ? 0.09 : 0.07),
    cardAlt: mix(s.card, s.ink, isDark ? 0.06 : 0.04),
    fill: alpha(s.ink, isDark ? 0.09 : 0.07),
    fill2: alpha(s.ink, isDark ? 0.15 : 0.13),
    thumb: isDark ? mix(s.card, s.ink, 0.3) : WHITE,
    glass: alpha(s.card, isDark ? 0.78 : 0.82),
    glassBorder: isDark ? alpha(s.ink, 0.14) : alpha(WHITE, 0.92),
    glassEdge: isDark ? alpha(BLACK, 0.5) : alpha(s.ink, 0.08),
    scrim: isDark ? alpha(BLACK, 0.6) : alpha(s.ink, 0.28),
    ink: s.ink,
    ink2: alpha(s.ink, isDark ? 0.68 : 0.7),
    ink3: alpha(s.ink, 0.5),
    line: alpha(s.ink, isDark ? 0.1 : 0.09),
    primary: s.primary,
    primaryDeep: mix(s.primary, BLACK, isDark ? 0.2 : 0.18),
    primaryInk,
    primarySoft: s.soft ?? alpha(s.primary, isDark ? 0.16 : 0.1),
    onPrimary: s.onPrimary,
    // the main "do it" button: ink on the page (black on light, light on dark)
    reward: s.ink,
    rewardDeep: mix(s.ink, BLACK, isDark ? 0.15 : 0.4),
    onReward: isDark ? s.bg : WHITE,
    shadow: isDark ? alpha(BLACK, 0.6) : alpha(s.ink, 0.06),
    tabBar: alpha(s.card, 0.86),
    // the focus timer room follows the look
    roomTop: isDark ? mix(s.bg, s.ink, 0.08) : mix(s.bg, WHITE, 0.6),
    roomMid: isDark ? s.bg : mix(s.bg, s.ink, 0.03),
    roomBottom: isDark ? mix(s.bg, BLACK, 0.5) : mix(s.bg, s.ink, 0.07),
    roomInk: s.ink,
    roomInk2: alpha(s.ink, isDark ? 0.68 : 0.7),
    roomGlass: alpha(s.ink, isDark ? 0.08 : 0.05),
  };
}

const seeds: Record<Palette, { light: Seed; dark: Seed }> = {
  // deep navy on white; light blue in dark
  ink: {
    light: { bg: '#FFFFFF', card: '#F3F6F8', ink: '#00171F', primary: '#003459', onPrimary: WHITE },
    dark: { bg: '#000D12', card: '#06202B', ink: '#EAF4F8', primary: '#7CC4F0', onPrimary: '#00171F' },
  },
  // warm pink paper, blush button with dark text
  blush: {
    light: { bg: '#F7EDF0', card: '#FFFCFD', ink: '#2B1A1D', primary: '#F4AFAB', onPrimary: '#3A1F22', primaryInk: '#9A3F3A', soft: '#F4CBC6' },
    dark: { bg: '#120C0D', card: '#21171A', ink: '#F7EDF0', primary: '#F4AFAB', onPrimary: '#3A1F22', soft: alpha('#F4CBC6', 0.14) },
  },
  // white with pink + powder blue
  cotton: {
    light: { bg: '#FFFFFF', card: '#F4F8F8', ink: '#1F2A2C', primary: '#FFCAD4', onPrimary: '#3A1F27', primaryInk: '#9B2C47', soft: '#B0D0D3' },
    dark: { bg: '#0B1112', card: '#162022', ink: '#EEF4F4', primary: '#FFCAD4', onPrimary: '#3A1F27', soft: alpha('#B0D0D3', 0.16) },
  },
  // off-white and forest green; soft sage in dark
  sage: {
    light: { bg: '#F4F6F1', card: '#FFFFFF', ink: '#16241C', primary: '#2F5D46', onPrimary: WHITE, soft: '#CFE1C9' },
    dark: { bg: '#0A100C', card: '#141D17', ink: '#EDF3EE', primary: '#A9CFAE', onPrimary: '#10241A' },
  },
  // the neutral look: black on white, white on black
  graphite: {
    light: { bg: '#FFFFFF', card: '#F5F5F7', ink: '#0B0B0D', primary: '#111113', onPrimary: WHITE },
    dark: { bg: '#000000', card: '#111113', ink: '#F5F5F7', primary: '#FFFFFF', onPrimary: BLACK, soft: alpha(WHITE, 0.12) },
  },
};

export const palettes = Object.fromEntries(
  PALETTES.map((p) => [p, { light: makeLook('light', seeds[p].light), dark: makeLook('dark', seeds[p].dark) }]),
) as Record<Palette, { light: ColorTokens; dark: ColorTokens }>;

/** The palette's two looks; unknown values (a newer save, a broken backup) fall back to Ink. */
export const looksOf = (p: string | undefined) =>
  p && Object.prototype.hasOwnProperty.call(palettes, p) ? palettes[p as Palette] : palettes.ink;

/** The default look (Ink). */
export const light = palettes.ink.light;
export const dark = palettes.ink.dark;

/** iOS Settings-style icon tiles (system colours, same in both schemes; the glyph is white). */
export const tiles = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  teal: '#30B0C7',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  gray: '#8E8E93',
} as const;
export type TileColor = keyof typeof tiles;

/** Pet body colours (illustration, not UI). */
export const petColors = {
  pink: '#FF5C9D',
  tangerine: '#FF8A3D',
  mint: '#2FD39A',
  violet: '#8C6BFF',
  sky: '#4FB8FF',
  midnight: '#3B3F8F',
  gold: '#FFC93C',
  lilac: '#C39BFF',
  mango: '#FFB23D',
  // weekly surprises (features/weekly): one free colour a week from day 7
  peach: '#FFA48A',
  lime: '#9BE15D',
  lagoon: '#1FB5B0',
  cocoa: '#A97458',
  plum: '#7A3E9D',
  coral: '#FF6B6B',
  denim: '#4F6DDB',
  blush: '#FFB3C7',
  storm: '#6E7B8F',
  cherry: '#E2324F',
} as const;
export type PetColor = keyof typeof petColors;

/** Home stage gradient per time of day, per scheme (top → bottom). */
export const stages = {
  // light mode: the pet's box stays light at every hour (soft warm / cool / dusk whites)
  light: {
    morning: ['#FFFFFF', '#FBF8F5', '#F3EEE9'],
    day: ['#FFFFFF', '#F7F8FA', '#EDEFF3'],
    night: ['#FBFBFD', '#F2F2F6', '#E8E8EE'],
  },
  // dark mode: graphite, a touch warmer in the morning
  dark: {
    morning: ['#1E1C1B', '#151413', '#0B0B0B'],
    day: ['#1B1C1F', '#131416', '#0A0A0B'],
    night: ['#19191C', '#111113', '#08080A'],
  },
} as const;

/** Closet "rooms": fixed scene gradients for the Home stage (top → bottom), same in both themes. */
export const roomGradients = {
  // muted, photographic tones (premium, not candy)
  sunset: ['#FCE8DE', '#F3D0C7', '#E2D0E2'],
  ocean: ['#E4F1F5', '#CCE2EC', '#B1CCDD'],
  garden: ['#E7EFE2', '#D1E0CC', '#B8CEB4'],
  golden: ['#FFF4DC', '#F5E2BB', '#E6CB95'],
  aurora: ['#E3F4EF', '#D6E3F5', '#E2D9F1'],
  galaxy: ['#2C2E3B', '#1B1C25', '#0D0D12'],
  // weekly surprises (features/weekly)
  lavender: ['#EEEAF7', '#DDD6EE', '#C9C0E2'],
  sand: ['#F7F0E3', '#EADFC9', '#D9C9A9'],
  mist: ['#EDF1F2', '#DAE2E5', '#C2CED4'],
  rose: ['#F9E9EC', '#F0D3DA', '#E2BAC6'],
} as const;

/** 8-pt grid. Gutter 16 = iOS inset-grouped margin on phones. */
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48, gutter: 16 } as const;
/** Continuous-corner radii (iOS 26 cards are 26, inset-grouped lists 26, buttons are capsules). */
export const radius = { chip: 999, button: 999, field: 14, row: 12, card: 26, scene: 32, sheet: 38 } as const;

/**
 * Type. iOS: the system font (SF Pro, with Apple's own optical sizes and tracking) and
 * SF Pro for everything (Display optical size at large sizes). Android / web: Inter, the closest open face, with the
 * size-specific tracking SF does for free.
 */
type Weight = '400' | '500' | '600' | '700' | '800';
const ANDROID_BODY: Record<Weight, string> = {
  '400': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  '800': 'Inter_700Bold',
};
// display = Inter too (Linear, Apple-like); the rounded Nunito read as childish
const ANDROID_DISPLAY: Record<Weight, string> = {
  '400': 'Inter_500Medium',
  '500': 'Inter_600SemiBold',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  '800': 'Inter_700Bold',
};

export const isIOS = Platform.OS === 'ios';

export function font(kind: 'body' | 'display', weight: Weight): TextStyle {
  if (isIOS) return { fontFamily: undefined, fontWeight: weight }; // SF Pro (Display at large sizes, automatically)
  return { fontFamily: (kind === 'display' ? ANDROID_DISPLAY : ANDROID_BODY)[weight] };
}

/** Apple text styles (HIG, default Dynamic Type size). */
export const typeScale = { footnote: 13, subhead: 15, body: 17, title3: 20, title2: 22, largeTitle: 34, timer: 76 } as const;

/** SF tracks large text tighter automatically; the Android faces need it by hand. */
export const tracking = (size: number) => (isIOS ? 0 : size >= 28 ? -0.02 * size : size >= 20 ? -0.01 * size : 0);

/** Kept for TextInputs. */
export const fonts = {
  body: font('body', '400'),
  bodyBold: font('body', '600'),
  display: font('display', '700'),
} as const;

/** docs/02: text caps Dynamic Type at 1.4x. */
export const MAX_FONT_SCALE = 1.4;
