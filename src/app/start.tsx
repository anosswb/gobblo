import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { plate } from '@/features/bites/logic';
import { useAppStore } from '@/state/app-store';

/**
 * gobblo://start?bite=<id> — the widget's Start button. Starts a 2-minute focus on
 * that bite and lands in Focus. If it can't (not onboarded, timer running): opens Home with that bite's start sheet (pick 2/5/15/25).
 * Bite gone (eaten in the app): just Home.
 */
export default function StartRoute() {
  const { bite } = useLocalSearchParams<{ bite?: string }>();

  useEffect(() => {
    const st = useAppStore.getState();
    const b = plate(st.bites).find((x) => x.id === bite);
    if (b && st.settings.onboarded && !st.focus) {
      st.startFocus({ id: b.id, text: b.text, size: b.size }, 2, '2min');
    }
    if (useAppStore.getState().focus) router.replace('/focus');
    else if (b) router.replace({ pathname: '/', params: { start: b.id, at: String(Date.now()) } });
    else router.replace('/');
  }, [bite]);

  return null;
}
