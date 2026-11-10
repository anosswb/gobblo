import { ADS, AD_IDS, USE_REAL_ADS } from '@/config/ads';

/**
 * Rewarded ads on Android (react-native-google-mobile-ads). Everything is lazy and defensive:
 * the library is loaded on the first "Watch" tap, never at app start, and an old test build
 * without the native module simply reports "unavailable". Consent (Google UMP) is gathered
 * before the first ad request.
 */
export type AdResult = 'earned' | 'closed' | 'unavailable';
type Lib = typeof import('react-native-google-mobile-ads');

export const adsSupported: boolean = ADS.enabled;

let lib: Lib | null | undefined;
function load(): Lib | null {
  if (lib !== undefined) return lib;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lib = require('react-native-google-mobile-ads') as Lib;
  } catch {
    lib = null; // native module missing (Expo Go, a build made before ads were added)
  }
  return lib;
}

let ready: Promise<boolean> | null = null;
function prepare(m: Lib): Promise<boolean> {
  ready ??= (async () => {
    try {
      const info = await m.AdsConsent.gatherConsent();
      if (!info.canRequestAds) return false;
      await m.default().initialize();
      return true;
    } catch {
      return false;
    }
  })().then((ok) => {
    if (!ok) ready = null; // offline or no consent yet: try again on the next tap
    return ok;
  });
  return ready;
}

/** Loads and shows one rewarded video. 'earned' only when Google says the reward was earned. */
export async function showRewarded(): Promise<AdResult> {
  if (!ADS.enabled) return 'unavailable';
  const m = load();
  if (!m || !(await prepare(m))) return 'unavailable';
  const unit = USE_REAL_ADS && AD_IDS.android.rewardedId ? AD_IDS.android.rewardedId : m.TestIds.REWARDED;
  return new Promise<AdResult>((resolve) => {
    let earned = false;
    let done = false;
    const offs: (() => void)[] = [];
    // only the loading has a time limit; once the video is on screen it ends by itself
    const loadLimit = setTimeout(() => finish('unavailable'), 15_000);
    function finish(r: AdResult) {
      if (done) return;
      done = true;
      clearTimeout(loadLimit);
      offs.forEach((off) => off());
      resolve(r);
    }
    try {
      const ad = m.RewardedAd.createForAdRequest(unit);
      offs.push(
        ad.addAdEventListener(m.RewardedAdEventType.LOADED, () => {
          clearTimeout(loadLimit);
          ad.show().catch(() => finish('unavailable'));
        }),
        ad.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        ad.addAdEventListener(m.AdEventType.CLOSED, () => finish(earned ? 'earned' : 'closed')),
        ad.addAdEventListener(m.AdEventType.ERROR, () => finish('unavailable')),
      );
      ad.load();
    } catch {
      finish('unavailable');
    }
  });
}

export async function privacyOptionsRequired(): Promise<boolean> {
  const m = load();
  if (!m) return false;
  try {
    const info = await m.AdsConsent.getConsentInfo();
    return info.privacyOptionsRequirementStatus === m.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  } catch {
    return false;
  }
}

export async function showPrivacyOptions(): Promise<void> {
  try {
    await load()?.AdsConsent.showPrivacyOptionsForm();
  } catch {
    // nothing to show
  }
}
