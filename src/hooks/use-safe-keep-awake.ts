import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Keep the screen on while focusing (docs/01). Never throws; skipped on web previews. */
export function useSafeKeepAwake(tag = 'focus', enabled = true) {
  useEffect(() => {
    if (Platform.OS === 'web' || !enabled) return;
    activateKeepAwakeAsync(tag).catch(() => undefined);
    return () => {
      void Promise.resolve(deactivateKeepAwake(tag)).catch(() => undefined);
    };
  }, [tag, enabled]);
}
