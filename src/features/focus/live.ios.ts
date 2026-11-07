import * as Linking from 'expo-linking';

import { sfSymbol } from '@/components/icon';
import { biteIcon } from '@/features/bites/bite-icon';
import { hasPack } from '@/features/plus/catalog';
import type { PersistedState } from '@/state/schema';
import { iosWidgetsEnabled } from '@/widgets/ios/enabled';
import type { FocusActivityIOS as Factory, FocusActivityProps } from '@/widgets/ios/focus-activity';

// loaded only when the widget extension exists (not in free-Apple-ID builds)
const FocusActivityIOS: typeof Factory | null = iosWidgetsEnabled
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@/widgets/ios/focus-activity').FocusActivityIOS
  : null;

/**
 * iOS: Start Kit's lock-screen timer is a Live Activity (Lock Screen + Dynamic Island).
 * Started, updated (pause / +5) and ended from the store, like the Android notification.
 */
export function syncFocusLive(s: Pick<PersistedState, 'focus' | 'unlocked' | 'pet'>, now = Date.now()) {
  if (!FocusActivityIOS) return;
  let running = [] as ReturnType<typeof Factory.getInstances>;
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
    symbol: sfSymbol(biteIcon(f.biteText, f.size)),
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
