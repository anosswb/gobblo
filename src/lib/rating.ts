import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

import { shouldAskRating } from '@/features/rating/logic';
import { track } from '@/lib/analytics';
import { useAppStore } from '@/state/app-store';

/**
 * Asks for a store rating when the rules allow (features/rating/logic). The version is saved
 * BEFORE the system sheet opens, so a crash or a quick dismiss can never ask twice. Never throws.
 */
export async function maybeAskRating(now = Date.now()): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const st = useAppStore.getState();
    const version = Constants.expoConfig?.version ?? '';
    if (!version) return;
    const ok = shouldAskRating({
      eaten: st.stats.eaten,
      firstOpen: st.settings.firstOpen,
      askedVersion: st.settings.ratingAskedVersion,
      version,
      now,
    });
    if (!ok || !(await StoreReview.isAvailableAsync())) return;
    st.updateSettings({ ratingAskedVersion: version });
    track('rating_prompted');
    await StoreReview.requestReview();
  } catch {
    // a rating prompt is never worth a crash
  }
}
