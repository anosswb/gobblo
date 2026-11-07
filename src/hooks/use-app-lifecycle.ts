import { useEffect } from 'react';
import { AppState } from 'react-native';

import { rescheduleNudges } from '@/features/nudges/schedule';
import { configureAudio, preloadSounds } from '@/lib/sound';
import { updateWidgets } from '@/widgets/update';
import { snapshot, useAppStore } from '@/state/app-store';

/**
 * Runs on launch and every time the app comes back to the foreground (docs/04):
 * new-day check (comeback days), audio mode, and a fresh nudge plan (so an active user
 * never gets the day-3 comeback note).
 */
export function useAppLifecycle() {
  useEffect(() => {
    const refresh = () => {
      useAppStore.getState().onAppActive();
      void configureAudio().catch(() => undefined);
      void rescheduleNudges(snapshot()).catch(() => undefined);
    };
    refresh();
    preloadSounds();
    updateWidgets();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    // nudge settings or reminders changed → rebuild the plan
    const unsub = useAppStore.subscribe((s, prev) => {
      if (
        s.settings.nudge !== prev.settings.nudge ||
        s.settings.nudgeSound !== prev.settings.nudgeSound ||
        s.settings.quietStart !== prev.settings.quietStart ||
        s.settings.quietEnd !== prev.settings.quietEnd ||
        s.reminders !== prev.reminders
      ) {
        void rescheduleNudges(snapshot()).catch(() => undefined);
      }
      // home-screen widget shows the next bite + whether one-tap start is unlocked
      if (s.bites !== prev.bites || s.unlocked !== prev.unlocked || s.pet.name !== prev.pet.name) updateWidgets();
      if (s.settings.mixWithMusic !== prev.settings.mixWithMusic || s.settings.soundOnSilent !== prev.settings.soundOnSilent) void configureAudio().catch(() => undefined);
    });
    return () => {
      sub.remove();
      unsub();
    };
  }, []);
}
