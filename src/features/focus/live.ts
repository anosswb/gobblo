import * as Linking from 'expo-linking';

import { hasPack } from '@/features/plus/catalog';
import type { PersistedState } from '@/state/schema';

import { focusLiveAvailable, hideFocus, showFocusRunning, showFocusStill } from '../../../modules/focus-live';

/**
 * Start Kit #2 (feature panel runner-up): the focus timer on the lock screen.
 * Android: an ongoing countdown notification (modules/focus-live). Called on every focus change.
 */
export function syncFocusLive(s: Pick<PersistedState, 'focus' | 'unlocked' | 'pet'>, now = Date.now()) {
  if (!focusLiveAvailable) return;
  const f = s.focus;
  if (!f || !hasPack(s.unlocked, 'startKit')) {
    hideFocus();
    return;
  }
  const uri = Linking.createURL('/focus');
  const title = `${s.pet.name} is working with you`;
  if (f.pausedRemaining !== null) {
    const min = Math.max(1, Math.ceil(f.pausedRemaining / 60_000));
    showFocusStill(`${s.pet.name} is waiting`, `Paused · ${min} min left · ${f.biteText}`, uri);
  } else if (f.endsAt <= now) {
    showFocusStill(`Time’s up! Come feed ${s.pet.name}`, f.biteText, uri);
  } else {
    showFocusRunning(f.endsAt, title, f.biteText, uri);
  }
}
