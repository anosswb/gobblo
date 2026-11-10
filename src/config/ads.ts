import Constants from 'expo-constants';

import ids from './ad-ids.json';

/**
 * The owner's controls for ads, all in one place (Anass, 2026-11-10).
 * Ads are rewarded videos only, and only when the person taps "Watch": never a banner, never a
 * pop-up, never in onboarding, Focus, Feed, Evolution or Brain dump (CLAUDE.md).
 */
export const ADS = {
  /** master switch: false hides every video offer */
  enabled: true,
  /** sparks for one finished video */
  rewardSparks: 5,
  /** videos a person can watch per pet day */
  maxPerDay: 3,
  /**
   * iPhone has no ads today (CLAUDE.md, docs/06). Turning this on is not enough by itself:
   * follow "Ads on iPhone" in docs/17-money-setup.md (linking, privacy label, tracking prompt).
   */
  ios: false,
} as const;

/** The real AdMob ids (src/config/ad-ids.json). Empty = test ads. */
export const AD_IDS = ids;

/**
 * Real ad units only in a store build. The dev app and the preview APK always show Google's
 * test ads: tapping your own real ads can get an AdMob account closed.
 */
export const USE_REAL_ADS = !__DEV__ && Constants.expoConfig?.extra?.variant !== 'preview';
