import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { plate } from '@/features/bites/logic';
import { hasPack } from '@/features/plus/catalog';
import { useAppStore } from '@/state/app-store';

/**
 * gobblo://start?bite=<id> — the widget's "Start 2 min" (Start Kit). Starts a 2-minute focus on
 * that bite and lands in Focus. Without Start Kit, or if the bite is gone, it just opens Home.
 */
export default function StartRoute() {
  const { bite } = useLocalSearchParams<{ bite?: string }>();

  useEffect(() => {
    const st = useAppStore.getState();
    const b = plate(st.bites).find((x) => x.id === bite);
    if (b && hasPack(st.unlocked, 'startKit') && st.settings.onboarded && !st.focus) {
      st.startFocus({ id: b.id, text: b.text, size: b.size }, 2, '2min');
    }
    router.replace(useAppStore.getState().focus ? '/focus' : '/');
  }, [bite]);

  return null;
}
