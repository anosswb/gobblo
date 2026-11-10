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
 * hide, don't fake). The code is wired (src/lib/purchases.ios.ts); it turns on with the build
 * variable EXPO_PUBLIC_PURCHASES_LIVE=1, set only once a real purchase and Restore work on a device.
 */
export const PURCHASES_LIVE = process.env.EXPO_PUBLIC_PURCHASES_LIVE === '1';

/**
 * Plus is shown only where it really works: Android packs are earned with sparks (no payment
 * needed); iOS only once purchases are live. Strict in dev builds too, so what Anass tests is what
 * users get (web preview follows iOS).
 */
export const PLUS_VISIBLE = MONETIZATION === 'ads' || PURCHASES_LIVE;
