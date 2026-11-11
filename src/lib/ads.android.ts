import { ADS, AD_IDS, USE_REAL_ADS } from '@/config/ads';
import { adErrorCode, canContinueAfterConsentError, joinReasons, shortError } from '@/features/plus/ad-reason';
import { track } from '@/lib/analytics';
import { adReason } from '@/lib/analytics-events';

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

let consentNote: string | null = null;
let failure: string | null = null;

/** Why the last ad did not show (short codes). For non-store builds only. */
export function lastAdError(): string | null {
  return joinReasons(consentNote, failure);
}

let ready: Promise<boolean> | null = null;
function prepare(m: Lib): Promise<boolean> {
  ready ??= (async () => {
    let canRequest = true;
    try {
      const info = await m.AdsConsent.gatherConsent();
      canRequest = info.canRequestAds;
      if (!canRequest) failure = 'consent-denied';
    } catch (e) {
      // Google's advice: do not stop. Use what the last consent info says.
      consentNote = `consent-error:${shortError(e)}`;
      try {
        const info = await m.AdsConsent.getConsentInfo();
        canRequest = canContinueAfterConsentError(info.status);
        if (!canRequest) failure = 'consent-denied';
      } catch {
        canRequest = true;
      }
    }
    if (!canRequest) return false;
    try {
      await m.default().initialize();
      return true;
    } catch (e) {
      failure = `init-error:${shortError(e)}`;
      return false;
    }
  })().then((ok) => {
    if (!ok) ready = null; // offline or no consent yet: try again on the next tap
    return ok;
  });
  return ready;
}

type Ad = ReturnType<Lib['RewardedAd']['createForAdRequest']>;
type Loaded = { ad: Ad } | { error: string };

function loadOnce(m: Lib, unit: string): Promise<Loaded> {
  return new Promise<Loaded>((resolve) => {
    const offs: (() => void)[] = [];
    let done = false;
    const end = (r: Loaded) => {
      if (done) return;
      done = true;
      clearTimeout(limit);
      offs.forEach((off) => off());
      resolve(r);
    };
    // only the loading has a time limit; once the video is on screen it ends by itself
    const limit = setTimeout(() => end({ error: 'load-timeout' }), 15_000);
    try {
      const ad = m.RewardedAd.createForAdRequest(unit);
      offs.push(
        ad.addAdEventListener(m.RewardedAdEventType.LOADED, () => end({ ad })),
        ad.addAdEventListener(m.AdEventType.ERROR, (e: unknown) => end({ error: `load-error:${adErrorCode(e)}` })),
      );
      ad.load();
    } catch (e) {
      end({ error: `load-error:${shortError(e)}` });
    }
  });
}

/** One automatic retry after a load error (not after a timeout). */
async function loadWithRetry(m: Lib): Promise<Loaded> {
  const unit = USE_REAL_ADS && AD_IDS.android.rewardedId ? AD_IDS.android.rewardedId : m.TestIds.REWARDED;
  const first = await loadOnce(m, unit);
  if ('ad' in first || first.error === 'load-timeout') return first;
  return loadOnce(m, unit);
}

let cached: Ad | null = null;
let loading: Promise<boolean> | null = null;

/** Loads one rewarded ad in the background and keeps it for the next "Watch" tap. */
export function preloadRewarded(): void {
  if (!ADS.enabled || cached || loading) return;
  const m = load();
  if (!m) return;
  loading = (async () => {
    if (!(await prepare(m))) return false;
    const r = await loadWithRetry(m);
    if ('ad' in r) {
      cached = r.ad;
      return true;
    }
    failure = r.error;
    return false;
  })()
    .catch(() => false)
    .finally(() => {
      loading = null;
    });
}

/** Shows one rewarded video (the preloaded one if there is one). 'earned' only when Google says the reward was earned. */
export async function showRewarded(): Promise<AdResult> {
  const result = await showRewardedInner();
  // anonymous count: the result and the reason code's prefix only (never the error text)
  track('ad_result', { result, reason: result === 'unavailable' ? adReason(failure ?? consentNote) : 'none' });
  return result;
}

async function showRewardedInner(): Promise<AdResult> {
  failure = null;
  if (!ADS.enabled) return 'unavailable';
  const m = load();
  if (!m) {
    failure = 'no-module';
    return 'unavailable';
  }
  if (loading) await loading;
  let ad = cached;
  cached = null; // an ad is used once: shown or failed, it is dropped
  if (!ad) {
    if (!(await prepare(m))) return 'unavailable';
    const r = await loadWithRetry(m);
    if (!('ad' in r)) {
      failure = r.error;
      return 'unavailable';
    }
    ad = r.ad;
  }
  const ready = ad;
  return new Promise<AdResult>((resolve) => {
    let earned = false;
    let done = false;
    const offs: (() => void)[] = [];
    const finish = (r: AdResult) => {
      if (done) return;
      done = true;
      offs.forEach((off) => off());
      resolve(r);
    };
    try {
      offs.push(
        ready.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        ready.addAdEventListener(m.AdEventType.CLOSED, () => finish(earned ? 'earned' : 'closed')),
        ready.addAdEventListener(m.AdEventType.ERROR, (e: unknown) => {
          failure = `show-error:${adErrorCode(e)}`;
          finish('unavailable');
        }),
      );
      ready.show().catch((e: unknown) => {
        failure = `show-error:${shortError(e)}`;
        finish('unavailable');
      });
    } catch (e) {
      failure = `show-error:${shortError(e)}`;
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
