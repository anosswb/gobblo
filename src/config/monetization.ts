import { Platform } from 'react-native';

/** docs/06: iOS sells one-time Plus (RevenueCat), Android shows optional AdMob ads. */
export type Monetization = 'iap' | 'ads';

export const MONETIZATION: Monetization = Platform.select<Monetization>({
  ios: 'iap',
  android: 'ads',
  default: 'iap',
});
