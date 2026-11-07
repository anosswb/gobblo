import { useEffect } from 'react';
import { AppState } from 'react-native';

import { rescheduleNudges } from '@/features/nudges/schedule';
import { configureAudio, preloadSounds } from '@/lib/sound';
import { syncFocusLive } from '@/features/focus/live';
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
    syncFocusLive(useAppStore.getState());
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
      // lock-screen focus timer (Start Kit) follows the session: start, pause, +5, end
      if (s.focus !== prev.focus || s.unlocked !== prev.unlocked) syncFocusLive(s);
      // home-screen widgets show the pet (name, colour, mood), the next bite, a running timer and Start Kit
      if (
        s.bites !== prev.bites ||
        s.unlocked !== prev.unlocked ||
        s.focus !== prev.focus ||
        s.pet.name !== prev.pet.name ||
        s.pet.color !== prev.pet.color ||
        s.stats.todayEaten !== prev.stats.todayEaten
      ) {
        updateWidgets();
      }
      if (s.settings.mixWithMusic !== prev.settings.mixWithMusic || s.settings.soundOnSilent !== prev.settings.soundOnSilent) void configureAudio().catch(() => undefined);
    });
    return () => {
      sub.remove();
      unsub();
    };
  }, []);
}
