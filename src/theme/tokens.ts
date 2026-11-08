import { Platform, type TextStyle } from 'react-native';

/**
 * Colour tokens, "Apple" direction (DECISIONS.md, 2026-11-06).
 * Built on the iOS system palette: grouped grey background, white cards, pure black in dark
 * mode with elevated greys, label / secondaryLabel / tertiaryLabel inks, hairline separators.
 * One tint colour (the pet's pink), lime only for rewards. Dark is designed, not inverted.
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
  /** the focus timer room: follows the theme (Anass 2026-11-08: dark timer in light mode looked broken) */
  roomTop: string;
  roomMid: string;
  roomBottom: string;
  roomInk: string;
  roomInk2: string;
  roomGlass: string;
  /** dark theme: dims bright scenes */
  sceneDim: string;
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
  sceneDim: 'rgba(0,0,0,0.18)',
  onPrimary: '#FFFFFF',
} as const;

export const light: ColorTokens = {
  ...shared,
  roomTop: '#FFFFFF',
  roomMid: '#F5F5F7',
  roomBottom: '#ECECF0',
  roomInk: '#0B0B0D',
  roomInk2: 'rgba(60,60,67,0.62)',
  roomGlass: 'rgba(0,0,0,0.05)',
  // Apple neutral light: soft grey canvas, solid white cards, hairline edges, no colour glows
  bg: '#F5F5F7',
  bgTop: '#FBFBFC',
  bgBottom: '#EFEFF2',
  glowA: 'rgba(255,255,255,0.9)',
  glowB: 'rgba(255,255,255,0)',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.06)',
  cardAlt: '#F2F2F5',
  fill: 'rgba(118,118,128,0.10)',
  fill2: 'rgba(118,118,128,0.18)',
  thumb: '#FFFFFF',
  glass: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(255,255,255,0.92)',
  glassEdge: 'rgba(0,0,0,0.08)',
  scrim: 'rgba(0,0,0,0.28)',
  ink: '#0B0B0D',
  ink2: 'rgba(60,60,67,0.64)',
  ink3: 'rgba(60,60,67,0.32)',
  line: 'rgba(0,0,0,0.08)',
  primary: '#E5307D',
  primaryDeep: '#B81E5E',
  primarySoft: 'rgba(229,48,125,0.10)',
  // the main "do it" button: ink on light, like Apple's primary black buttons
  reward: '#0B0B0D',
  rewardDeep: '#000000',
  onReward: '#FFFFFF',
  success: '#34C759',
  pink: '#FF4F96',
  danger: '#FF3B30',
  shadow: 'rgba(0,0,0,0.06)',
  tabBar: 'rgba(255,255,255,0.86)',
};

export const dark: ColorTokens = {
  ...shared,
  roomTop: '#1C1C1F',
  roomMid: '#111113',
  roomBottom: '#050506',
  roomInk: '#FFFFFF',
  roomInk2: 'rgba(235,235,245,0.6)',
  roomGlass: 'rgba(255,255,255,0.08)',
  // Apple neutral dark: near-black, graphite cards, white hairlines, one soft top light. No pink/purple.
  bg: '#0A0A0B',
  bgTop: '#151517',
  bgBottom: '#050506',
  glowA: 'rgba(255,255,255,0.05)',
  glowB: 'rgba(255,255,255,0)',
  card: 'rgba(255,255,255,0.055)',
  cardSolid: '#161618',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardAlt: 'rgba(255,255,255,0.06)',
  fill: 'rgba(255,255,255,0.08)',
  fill2: 'rgba(255,255,255,0.14)',
  thumb: '#636366',
  glass: 'rgba(30,30,32,0.72)',
  glassBorder: 'rgba(255,255,255,0.14)',
  glassEdge: 'rgba(0,0,0,0.5)',
  scrim: 'rgba(0,0,0,0.55)',
  ink: '#F5F5F7',
  ink2: 'rgba(235,235,245,0.6)',
  ink3: 'rgba(235,235,245,0.3)',
  line: 'rgba(255,255,255,0.08)',
  primary: '#FF4F96',
  primaryDeep: '#D02D70',
  primarySoft: 'rgba(255,79,150,0.16)',
  reward: '#F5F5F7',
  rewardDeep: '#D1D1D6',
  onReward: '#0B0B0D',
  success: '#30D158',
  pink: '#FF6FA8',
  danger: '#FF453A',
  shadow: 'rgba(0,0,0,0.6)',
  tabBar: 'rgba(22,22,24,0.86)',
};

/** Tint choices (docs/12 #14), all iOS system colours. Free on both stores. */
export const accents = {
  berry: { light: ['#E5307D', '#B81E5E'], dark: ['#FF4F96', '#D02D70'], label: 'Pink' },
  cobalt: { light: ['#007AFF', '#0062CC'], dark: ['#0A84FF', '#0066CC'], label: 'Blue' },
  jade: { light: ['#248A3D', '#1B6B2F'], dark: ['#30D158', '#24A148'], label: 'Green' },
  sunset: { light: ['#C93400', '#A32A00'], dark: ['#FF9F0A', '#CC7F08'], label: 'Orange' },
} as const;

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
