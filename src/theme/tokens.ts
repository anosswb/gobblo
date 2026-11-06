/**
 * Colour tokens. Direction A + C (DECISIONS.md):
 * light = "cozy diorama" (lilac paper, frosted glass over illustrated scenes),
 * dark  = "night studio" (deep navy, one lime accent). Dark is designed, not inverted.
 * Components must only use these tokens. No hex values in components.
 */
export type ColorTokens = {
  bg: string;
  card: string;
  cardAlt: string;
  glass: string;
  glassBorder: string;
  scrim: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  primary: string;
  primaryDeep: string;
  onPrimary: string;
  reward: string;
  rewardDeep: string;
  onReward: string;
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
  /** dark theme: dims bright day/morning scenes (docs/02: 12% black) */
  sceneDim: string;
};

const shared = {
  reward: '#C6F432',
  rewardDeep: '#8DB50E',
  onReward: '#1B1530', // docs/02: text on lime is always the light ink
  sun: '#FFC83D',
  focusTop: '#4D49FF',
  focusMid: '#211D74',
  focusBottom: '#120F3D',
  onFocus: '#FFFFFF',
  onFocus2: 'rgba(255,255,255,0.78)',
  focusGlass: 'rgba(255,255,255,0.12)',
  focusScrim: 'rgba(8,6,30,0.55)',
  sceneDim: 'rgba(0,0,0,0.12)',
} as const;

export const light: ColorTokens = {
  ...shared,
  bg: '#F0EFFF',
  card: '#FFFFFF',
  cardAlt: '#E8E7FF',
  glass: 'rgba(255,255,255,0.66)',
  glassBorder: 'rgba(255,255,255,0.7)',
  scrim: 'rgba(27,21,48,0.42)',
  ink: '#1B1530',
  ink2: 'rgba(27,21,48,0.68)',
  ink3: 'rgba(27,21,48,0.45)',
  line: 'rgba(61,59,255,0.13)',
  primary: '#3D3BFF',
  primaryDeep: '#2422C2',
  onPrimary: '#FFFFFF',
  pink: '#FF5C8A',
  danger: '#E5484D',
  shadow: 'rgba(61,59,255,0.22)',
  tabBar: 'rgba(255,255,255,0.94)',
};

export const dark: ColorTokens = {
  ...shared,
  bg: '#0B0A1A',
  card: '#16142C',
  cardAlt: '#1E1B3A',
  glass: 'rgba(20,17,50,0.58)',
  glassBorder: 'rgba(255,255,255,0.12)',
  scrim: 'rgba(5,4,14,0.6)',
  ink: '#EDEBFF',
  ink2: 'rgba(237,235,255,0.72)',
  ink3: 'rgba(237,235,255,0.5)',
  line: 'rgba(160,158,255,0.16)',
  primary: '#6F6CFF',
  primaryDeep: '#3D3BCC',
  onPrimary: '#FFFFFF',
  pink: '#FF6F98',
  danger: '#FF6369',
  shadow: 'rgba(0,0,0,0.45)',
  tabBar: 'rgba(11,10,26,0.96)',
};

/** App accent themes (docs/12 #14). Primary + its deep edge, per scheme. Free on both stores. */
export const accents = {
  cobalt: { light: ['#3D3BFF', '#2422C2'], dark: ['#6F6CFF', '#3D3BCC'], label: 'Cobalt' },
  berry: { light: ['#D6336C', '#9E1F4D'], dark: ['#FF5C8A', '#C2335F'], label: 'Berry' },
  jade: { light: ['#0E8F68', '#086B4D'], dark: ['#22C993', '#128A63'], label: 'Jade' },
  sunset: { light: ['#E2551F', '#A93A10'], dark: ['#FF8A3D', '#C4601F'], label: 'Sunset' },
} as const;

export const petColors = {
  pink: '#FF5C8A',
  tangerine: '#FF8A3D',
  mint: '#22C993',
  violet: '#8C6BFF',
} as const;
export type PetColor = keyof typeof petColors;

/** 8-pt grid (docs/02). */
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48, gutter: 20 } as const;
export const radius = { chip: 999, button: 18, card: 24, scene: 32, sheet: 32 } as const;

/** Type scale: only 4 sizes + numerals (docs/02, mobile-app-ui-design: max 4 sizes). */
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'Figtree_500Medium',
  bodyBold: 'Figtree_700Bold',
} as const;
export const typeScale = { s: 13, m: 16, l: 22, xl: 34, timer: 52 } as const;
/** docs/02: display text caps Dynamic Type at 1.4x. */
export const MAX_FONT_SCALE = 1.4;
