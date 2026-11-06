import { Platform, type TextStyle } from 'react-native';

/**
 * Colour tokens, "Apple" direction (DECISIONS.md, 2026-11-06).
 * Built on the iOS system palette: grouped grey background, white cards, pure black in dark
 * mode with elevated greys, label / secondaryLabel / tertiaryLabel inks, hairline separators.
 * One tint colour (the pet's pink), lime only for rewards. Dark is designed, not inverted.
 * Components must only use these tokens. No hex values in components.
 */
export type ColorTokens = {
  /** systemGroupedBackground */
  bg: string;
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
  /** dark theme: dims bright scenes */
  sceneDim: string;
};

const shared = {
  reward: '#C3F53C',
  rewardDeep: '#8DB50E',
  onReward: '#14200A',
  sun: '#FFCC00',
  focusTop: '#2A1E5C',
  focusMid: '#120E2E',
  focusBottom: '#05040D',
  onFocus: '#FFFFFF',
  onFocus2: 'rgba(235,235,245,0.62)',
  focusGlass: 'rgba(255,255,255,0.10)',
  focusScrim: 'rgba(5,4,13,0.55)',
  sceneDim: 'rgba(0,0,0,0.18)',
  onPrimary: '#FFFFFF',
} as const;

export const light: ColorTokens = {
  ...shared,
  bg: '#F2F2F7',
  card: '#FFFFFF',
  cardAlt: '#F2F2F7',
  fill: 'rgba(118,118,128,0.12)',
  fill2: 'rgba(120,120,128,0.16)',
  thumb: '#FFFFFF',
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.85)',
  glassEdge: 'rgba(0,0,0,0.06)',
  scrim: 'rgba(0,0,0,0.32)',
  ink: '#000000',
  ink2: 'rgba(60,60,67,0.6)',
  ink3: 'rgba(60,60,67,0.3)',
  line: 'rgba(60,60,67,0.2)',
  primary: '#E5307D',
  primaryDeep: '#B81E5E',
  primarySoft: 'rgba(229,48,125,0.12)',
  success: '#34C759',
  pink: '#FF4F96',
  danger: '#FF3B30',
  shadow: 'rgba(0,0,0,0.08)',
  tabBar: 'rgba(255,255,255,0.8)',
};

export const dark: ColorTokens = {
  ...shared,
  bg: '#000000',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  fill: 'rgba(118,118,128,0.24)',
  fill2: 'rgba(120,120,128,0.32)',
  thumb: '#636366',
  glass: 'rgba(37,37,40,0.72)',
  glassBorder: 'rgba(255,255,255,0.16)',
  glassEdge: 'rgba(0,0,0,0.4)',
  scrim: 'rgba(0,0,0,0.5)',
  ink: '#FFFFFF',
  ink2: 'rgba(235,235,245,0.6)',
  ink3: 'rgba(235,235,245,0.3)',
  line: 'rgba(84,84,88,0.6)',
  primary: '#FF4F96',
  primaryDeep: '#D02D70',
  primarySoft: 'rgba(255,79,150,0.18)',
  success: '#30D158',
  pink: '#FF6FA8',
  danger: '#FF453A',
  shadow: 'rgba(0,0,0,0.5)',
  tabBar: 'rgba(28,28,30,0.8)',
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
} as const;
export type PetColor = keyof typeof petColors;

/** Home stage gradient per time of day, per scheme (top → bottom). */
export const stages = {
  light: {
    morning: ['#FFE3D3', '#FFD0E4', '#F7E8FF'],
    day: ['#CFE8FF', '#E6E0FF', '#FFE6F1'],
    night: ['#2B2160', '#1A1440', '#120E2E'],
  },
  dark: {
    morning: ['#4A2140', '#2A1630', '#120C1A'],
    day: ['#173055', '#1F1A45', '#100C20'],
    night: ['#2A1F66', '#160F3A', '#08061A'],
  },
} as const;

/** 8-pt grid. Gutter 16 = iOS inset-grouped margin on phones. */
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48, gutter: 16 } as const;
/** Continuous-corner radii (iOS 26 cards are 26, inset-grouped lists 26, buttons are capsules). */
export const radius = { chip: 999, button: 999, field: 14, row: 12, card: 26, scene: 32, sheet: 38 } as const;

/**
 * Type. iOS: the system font (SF Pro, with Apple's own optical sizes and tracking) and
 * SF Pro Rounded for display. Android / web: Inter + Nunito, the closest open faces, with the
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
const ANDROID_DISPLAY: Record<Weight, string> = {
  '400': 'Nunito_600SemiBold',
  '500': 'Nunito_600SemiBold',
  '600': 'Nunito_700Bold',
  '700': 'Nunito_800ExtraBold',
  '800': 'Nunito_800ExtraBold',
};

export const isIOS = Platform.OS === 'ios';

export function font(kind: 'body' | 'display', weight: Weight): TextStyle {
  if (isIOS) return { fontFamily: kind === 'display' ? 'ui-rounded' : undefined, fontWeight: weight };
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
