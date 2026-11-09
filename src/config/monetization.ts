import { Platform } from 'react-native';

/** docs/06: iOS sells one-time Plus (RevenueCat), Android shows optional AdMob ads. */
export type Monetization = 'iap' | 'ads';

export const MONETIZATION: Monetization = Platform.select<Monetization>({
  ios: 'iap',
  android: 'ads',
  default: 'iap',
});

/**
 * iOS App Store purchases are wired and tested (RevenueCat, Phase 6). Until then, iPhone users
 * never see Plus: no "coming soon" prices, no Plus badges, no Plus row (Anass, 2026-11-09:
 * hide, don't fake). Flip to true only once a real purchase and Restore work on a device.
 */
export const PURCHASES_LIVE = false;

/**
 * Plus is shown only where it really works: Android packs are earned with sparks (no payment
 * needed); iOS only once purchases are live. Strict in dev builds too, so what Anass tests is what
 * users get (web preview follows iOS).
 */
export const PLUS_VISIBLE = MONETIZATION === 'ads' || PURCHASES_LIVE;
