import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { flush, screen, setEnabled, track } from '@/lib/analytics';
import { bucket, SECOND_BUCKETS, screenName } from '@/lib/analytics-events';
import { setCrashReports } from '@/lib/crash';
import { useAppStore } from '@/state/app-store';

/**
 * Starts crash reports + anonymous analytics as early as possible, following the user's switch
 * (Settings › Privacy & data › Share anonymous usage). Called once at module load in _layout.
 */
export function initTelemetry(): void {
  const on = useAppStore.getState().settings.shareUsage !== false;
  setCrashReports(on);
  setEnabled(on);
}

/** App opens, session length (bucketed), screen names, and the switch. Mounted once in the root stack. */
export function useAnalytics(): void {
  const pathname = usePathname();
  const lastScreen = useRef<string | null>(null);

  useEffect(() => {
    let activeSince = Date.now();
    track('app_opened', { first_open: !useAppStore.getState().settings.onboarded });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        activeSince = Date.now();
        track('app_opened', { first_open: false });
      } else if (s === 'background') {
        track('session_end', { seconds: bucket((Date.now() - activeSince) / 1000, SECOND_BUCKETS) });
        flush();
      }
    });
    const unsub = useAppStore.subscribe((st, prev) => {
      if (st.settings.shareUsage !== prev.settings.shareUsage) {
        const on = st.settings.shareUsage !== false;
        setCrashReports(on);
        setEnabled(on);
      }
    });
    return () => {
      sub.remove();
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname === lastScreen.current) return;
    lastScreen.current = pathname;
    const s = screenName(pathname);
    screen(s.name);
    if (s.tool) track('tool_opened', { tool: s.tool });
    if (s.name === 'plus') track('plus_seen');
  }, [pathname]);
}
