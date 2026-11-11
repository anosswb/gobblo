import { Platform } from 'react-native';

import { clean, isEventName, type CleanProps, type EventName, type EventProps, type ScreenName } from './analytics-events';

/**
 * Anonymous product analytics (PostHog, EU cloud). docs/19-analytics.md.
 *
 * - Off when EXPO_PUBLIC_POSTHOG_KEY is missing (tests, forks, web preview): every call is a no-op.
 * - Off when the user turned "Share anonymous usage" off (setEnabled(false) → PostHog optOut).
 * - Anonymous: no identify/alias, no person profiles, PostHog's random install id only.
 * - No autocapture (we never mount PostHogProvider), no session replay, no lifecycle events,
 *   no feature flags or surveys, no push-token capture.
 * - Only events and props from analytics-events.ts; clean() drops anything else, and
 *   before_send drops any event that is not ours and any person properties.
 */

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

type Client = import('posthog-react-native').PostHog;
type CaptureEvent = { event: string; properties?: Record<string, unknown>; $set?: unknown; $set_once?: unknown };

let client: Client | null = null;
let enabled = false;
let failed = false;

/** PostHog keeps its queue and random id in our MMKV store (no extra native storage package). */
function phStorage() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { storage } = require('@/lib/storage') as typeof import('@/lib/storage');
  return {
    getItem: (key: string) => storage.getString(`ph:${key}`) ?? null,
    setItem: (key: string, value: string) => storage.set(`ph:${key}`, value),
  };
}

/** Last guard before anything leaves the phone. Exported for the tests. */
export function beforeSend(e: CaptureEvent): CaptureEvent | null {
  if (!isEventName(e.event)) return null;
  const props = e.properties ?? {};
  const ours = clean(e.event, Object.fromEntries(Object.entries(props).filter(([k]) => !k.startsWith('$'))));
  if (!ours) return null;
  // the SDK's own $-props (os, app version, device model, $lib…) stay; ours are re-cleaned
  const sdk = Object.fromEntries(Object.entries(props).filter(([k]) => k.startsWith('$') && k !== '$device_name' && k !== '$set' && k !== '$set_once'));
  const out: CaptureEvent = { ...e, properties: { ...sdk, ...ours } };
  delete out.$set;
  delete out.$set_once;
  return out;
}

function getClient(): Client | null {
  if (client || failed || !KEY || Platform.OS === 'web' || process.env.NODE_ENV === 'test') return client;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PostHog } = require('posthog-react-native') as typeof import('posthog-react-native');
    client = new PostHog(KEY, {
      host: HOST,
      personProfiles: 'never',
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
      preloadFeatureFlags: false,
      disableRemoteFeatureFlags: true,
      sendFeatureFlagEvent: false,
      disableSurveys: true,
      setDefaultPersonProperties: false,
      capturePushNotificationSubscriptions: false,
      capturePushNotificationOpened: false,
      errorTracking: { autocapture: false },
      customStorage: phStorage(),
      // language only ("en"), never the region; no user-set device name
      customAppProperties: (p) => ({ ...p, $device_name: null, $locale: p.$locale ? p.$locale.slice(0, 2) : null }),
      before_send: (e) => beforeSend(e as CaptureEvent) as typeof e | null,
    });
  } catch {
    failed = true;
    client = null;
  }
  return client;
}

/** True when a key exists in this build (the switch is shown either way). */
export const analyticsAvailable = !!KEY;

/** Follows Settings › Privacy & data › Share anonymous usage. */
export function setEnabled(on: boolean): void {
  enabled = on;
  if (!KEY) return;
  const c = on ? getClient() : client;
  if (!c) return;
  void (on ? c.optIn() : c.optOut()).catch(() => undefined);
}

/** Sends one anonymous event. Silently does nothing when off or not configured. Never throws. */
export function track<E extends EventName>(event: E, props?: EventProps<E>): void {
  if (!enabled || !KEY) return;
  const p: CleanProps | null = clean(event, props as Record<string, unknown> | undefined);
  if (!p) return;
  try {
    getClient()?.capture(event, p);
  } catch {
    // analytics is never worth a crash
  }
}

/** One screen view (name from the fixed list). */
export function screen(name: ScreenName): void {
  track('screen', { name });
}

/** Sends what is queued now (the app is going to the background). */
export function flush(): void {
  if (!enabled || !client) return;
  void client.flush().catch(() => undefined);
}
