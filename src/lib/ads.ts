/**
 * Rewarded ads. This file is the default (iPhone, web, tests): no ads at all.
 * Android uses ads.android.ts (Google Mobile Ads). Same functions in both.
 */
export type AdResult = 'earned' | 'closed' | 'unavailable';

export const adsSupported = false;

export async function showRewarded(): Promise<AdResult> {
  return 'unavailable';
}

/** True when Google's consent rules say the person must be able to reopen the privacy form. */
export async function privacyOptionsRequired(): Promise<boolean> {
  return false;
}

export async function showPrivacyOptions(): Promise<void> {}
