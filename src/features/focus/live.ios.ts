import * as Linking from 'expo-linking';

import { FOOD } from '@/features/bites/logic';
import { hasPack } from '@/features/plus/catalog';
import type { PersistedState } from '@/state/schema';
import { FocusActivityIOS, type FocusActivityProps } from '@/widgets/ios/focus-activity';

/**
 * iOS: Start Kit's lock-screen timer is a Live Activity (Lock Screen + Dynamic Island).
 * Started, updated (pause / +5) and ended from the store, like the Android notification.
 */
export function syncFocusLive(s: Pick<PersistedState, 'focus' | 'unlocked' | 'pet'>, now = Date.now()) {
  let running = [] as ReturnType<typeof FocusActivityIOS.getInstances>;
  try {
    running = FocusActivityIOS.getInstances();
  } catch {
    return; // Live Activities off in Settings, or an older iOS
  }
  const f = s.focus;
  if (!f || !hasPack(s.unlocked, 'startKit') || (f.pausedRemaining === null && f.endsAt <= now)) {
    running.forEach((a) => void a.end('immediate').catch(() => undefined));
    return;
  }
  const props: FocusActivityProps = {
    petName: s.pet.name,
    biteText: f.biteText,
    emoji: FOOD[f.size].emoji,
    startedAt: f.startedAt,
    endsAt: f.endsAt,
    pausedLeft: f.pausedRemaining,
  };
  try {
    if (running[0]) void running[0].update(props).catch(() => undefined);
    else FocusActivityIOS.start(props, Linking.createURL('/focus'));
  } catch {
    // Live Activities can be refused by the system; focus works without them
  }
}
