import { Platform, TurboModuleRegistry } from 'react-native';

/**
 * Crash reports (Sentry, EU region). docs/19-analytics.md.
 *
 * - Off when EXPO_PUBLIC_SENTRY_DSN is missing (tests, forks, web preview).
 * - Started only when "Share anonymous usage" is on; turning it off makes beforeSend drop everything.
 * - No personal data: sendDefaultPii off, no user, no breadcrumbs at all (they can carry
 *   console text, touch labels or route params), no screenshots, no view hierarchy, no replay,
 *   no performance tracing. scrubEvent() strips request, user, extra, plain messages and the
 *   device name before an event leaves the phone.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

type Event = {
  message?: unknown;
  user?: unknown;
  request?: unknown;
  extra?: unknown;
  breadcrumbs?: unknown;
  server_name?: unknown;
  contexts?: Record<string, Record<string, unknown> | undefined>;
  exception?: { values?: { type?: string; value?: string }[] };
  logentry?: unknown;
};

let started = false;
let enabled = false;

const MAX_VALUE = 200;

/** Removes anything that could hold user text or identity. Exported for the tests. */
export function scrubEvent<T extends Event>(event: T): T | null {
  if (!enabled) return null;
  const e: T = { ...event };
  delete e.user;
  delete e.request;
  delete e.extra;
  delete e.breadcrumbs;
  delete e.server_name;
  // captureMessage text and log entries can hold state: errors keep only their type + a short value
  delete e.message;
  delete e.logentry;
  if (e.contexts) {
    const contexts = { ...e.contexts };
    if (contexts.device) {
      const { name: _name, ...device } = contexts.device;
      contexts.device = device;
    }
    delete contexts.state;
    e.contexts = contexts;
  }
  if (e.exception?.values) {
    e.exception = {
      ...e.exception,
      values: e.exception.values.map((v) => ({ ...v, value: typeof v.value === 'string' ? v.value.slice(0, MAX_VALUE) : v.value })),
    };
  }
  return e;
}

function start(): void {
  if (started || !DSN || Platform.OS === 'web' || process.env.NODE_ENV === 'test') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
    // an old dev build without the native module still reports JS errors
    const native = TurboModuleRegistry.get('RNSentry') != null;
    Sentry.init({
      dsn: DSN,
      environment: __DEV__ ? 'development' : 'production',
      enableNative: native,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      enableAutoPerformanceTracing: false,
      enableAppStartTracking: false,
      enableNativeFramesTracking: false,
      enableStallTracking: false,
      enableUserInteractionTracing: false,
      enableCaptureFailedRequests: false,
      enableAutoSessionTracking: false,
      attachScreenshot: false,
      attachViewHierarchy: false,
      maxBreadcrumbs: 0,
      beforeBreadcrumb: () => null,
      beforeSend: (event) => scrubEvent(event as Event) as typeof event | null,
    });
    started = true;
  } catch {
    // crash reporting is never worth a crash
  }
}

/** Follows Settings › Privacy & data › Share anonymous usage. */
export function setCrashReports(on: boolean): void {
  enabled = on;
  if (on) start();
}
