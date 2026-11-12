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
let sentry: typeof import('@sentry/react-native') | null = null;

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
    sentry = Sentry;
    started = true;
  } catch {
    // crash reporting is never worth a crash
  }
}

/**
 * Home-screen widget trail (Anass 2026-11-12: widgets stayed on an old bite with no clue why).
 * Sentry breadcrumbs stay off; instead the last few widget steps are kept here as numbers only
 * (how many placed widgets were found, how many bites are on the plate) and sent with a widget
 * error as the `widget` context. Never a bite's text or the pet's name.
 */
type WidgetStep = Record<string, number | string>;
const widgetTrail: WidgetStep[] = [];
const MAX_STEPS = 12;

export function widgetStep(step: string, counts: Record<string, number> = {}): void {
  widgetTrail.push({ step, at: Math.round(Date.now() / 1000), ...counts });
  if (widgetTrail.length > MAX_STEPS) widgetTrail.shift();
}

/** For tests. */
export const widgetTrailForTests = (): readonly WidgetStep[] => widgetTrail;

/** Text in quotes inside an error message could be a bite: keep only the shape of the message. */
export function scrubErrorText(message: string): string {
  return message.replace(/(["'“”‘’`]).*?\1/g, '"…"').replace(/[“”‘’][^“”‘’]*[“”‘’]/g, '"…"').slice(0, 160);
}

/**
 * A widget redraw or the headless widget task failed: report it (when the user's switch is on).
 * `stage` says where (read, render:NextBite, request:PetSmall, task:WIDGET_UPDATE, pin).
 */
export function reportWidgetError(stage: string, error: unknown): void {
  widgetStep(`error:${stage}`);
  if (!started || !enabled || !sentry) return;
  try {
    const raw = error instanceof Error ? error : new Error(String(error));
    const clean = new Error(`widget ${stage}: ${scrubErrorText(raw.message)}`);
    clean.name = raw.name || 'Error';
    if (raw.stack) clean.stack = raw.stack.split('\n').filter((l) => !l.includes(raw.message)).join('\n');
    sentry.captureException(clean, {
      tags: { area: 'widget', widget_stage: stage.split(':')[0] },
      contexts: { widget: { stage, trail: JSON.stringify(widgetTrail) } },
    });
  } catch {
    // crash reporting is never worth a crash
  }
}

/** Follows Settings › Privacy & data › Share anonymous usage. */
export function setCrashReports(on: boolean): void {
  enabled = on;
  if (on) start();
}
