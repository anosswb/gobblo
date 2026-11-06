import { Easing } from 'react-native-reanimated';

/**
 * Motion tokens. Sources (kept 1:1, see research/motion-specs.md):
 * - transitions.dev _root.css (durations, easings)
 * - Screenrove get_motion exact springs (tabs, reorder, sliding number, like burst, live activity)
 * Rules: UI motion < 300 ms, exits ~70% of enters, never bounce a close, never scale from 0.
 */
export const duration = {
  stagger: 40,
  micro: 80,
  quick: 150,
  fast: 250,
  medium: 350,
  slow: 400,
  verySlow: 500,
} as const;

export const easing = {
  smoothOut: Easing.bezier(0.22, 1, 0.36, 1),
  strongOut: Easing.bezier(0.23, 1, 0.32, 1),
  sheet: Easing.bezier(0.32, 0.72, 0, 1), // Vaul iOS sheet curve, 500 ms
  bounce: Easing.bezier(0.34, 1.36, 0.64, 1), // entrances only
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  exitIn: Easing.bezier(0.4, 0, 1, 1),
} as const;

/** Reanimated withSpring configs. Settle times from Screenrove. */
export const spring = {
  /** tab plateau (interior-tabs): looks done ~240 ms */
  plateau: { stiffness: 620, damping: 42, mass: 0.35 },
  /** tab panel slide-in 12 px (interior-tabs) */
  panel: { stiffness: 460, damping: 38, mass: 0.8 },
  /** list neighbours, segmented thumb, burst icon (interior-*) */
  firm: { stiffness: 520, damping: 34, mass: 0.45 },
  /** reorder drop with carried velocity */
  drop: { stiffness: 200, damping: 40, mass: 1 },
  /** sliding number digits (motion-primitives) */
  digit: { stiffness: 280, damping: 18, mass: 0.3 },
  /** soft cross-fades, count roll (like burst) */
  soft: { stiffness: 260, damping: 34, mass: 0.8 },
  /** live-activity pod */
  pod: { stiffness: 420, damping: 36, mass: 0.9 },
  /** progress fill (belly meter) */
  fill: { stiffness: 210, damping: 34, mass: 0.9 },
  /** docs/03 character springs */
  pop: { damping: 12, stiffness: 260, mass: 0.8 },
  wobble: { damping: 8, stiffness: 200, mass: 1 },
} as const;

export const scale = { press: 0.97, modal: 0.96, dropdown: 0.97, tooltip: 0.98, burstFrom: 0.55 } as const;
export const distance = { micro: 4, small: 6, base: 8, medium: 12, large: 30 } as const;

/** Max total stagger so the last item never feels late. */
export const staggerDelay = (index: number, step: number = duration.stagger, maxItems = 8) =>
  Math.min(index, maxItems) * step;
