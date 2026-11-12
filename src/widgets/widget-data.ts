import { sfSymbol, type IconName } from '@/components/icon';
import { biteIcon } from '@/features/bites/bite-icon';
import { FOOD, plate } from '@/features/bites/logic';
import { storage } from '@/lib/storage';
import { dayKey, type PersistedState } from '@/state/schema';
import { petColors, type PetColor } from '@/theme/tokens';

import type { WidgetMood } from './svg-art';

export interface WidgetData {
  petName: string;
  /** the pet's colour as hex (widgets draw it in the user's colour) */
  petColor: string;
  mood: WidgetMood;
  bite: { id: string; text: string; icon: IconName; symbol: string; min: number } | null;
  /** which bite the widget shows (1-based) after skips, and how many are on the plate */
  position: number;
  left: number;
  /** a focus timer is running: show it instead of the next bite */
  focus: { text: string; endsAt: number } | null;
  fedToday: number;
}

const SKIP_KEY = 'widget-skip';

/** "Skip" on the widget: show the next bite on the plate (wraps around). Free for everyone. */
export function skipWidgetBite() {
  storage.set(SKIP_KEY, (storage.getNumber(SKIP_KEY) ?? 0) + 1);
}

function readState(): Partial<PersistedState> {
  try {
    const raw = storage.getString('app-state');
    if (raw) return (JSON.parse(raw) as { state?: Partial<PersistedState> }).state ?? {};
  } catch {
    // broken or missing data: show the empty widget
  }
  return {};
}

/** Settings › Privacy & data › Share anonymous usage, read headless (the widget task has no store). */
export function shareUsageOn(): boolean {
  return readState().settings?.shareUsage !== false;
}

/**
 * Reads the saved app state straight from MMKV. The widget task runs headless (the app may be
 * closed), so it cannot use the React store.
 */
export function readWidgetData(now = new Date()): WidgetData {
  const s = readState();
  const list = plate(s.bites ?? [], dayKey(now));
  const skip = storage.getNumber(SKIP_KEY) ?? 0;
  const index = list.length ? skip % list.length : 0;
  const pick = list[index];
  const hour = now.getHours();
  const focus = s.focus && (s.focus.pausedRemaining !== null || s.focus.endsAt > now.getTime()) ? { text: s.focus.biteText, endsAt: s.focus.endsAt } : null;
  const icon = pick ? biteIcon(pick.text, pick.size) : 'list';
  return {
    petName: s.pet?.name ?? 'Pip',
    petColor: petColors[(s.pet?.color as PetColor) ?? 'caramel'] ?? petColors.caramel,
    mood: focus ? 'focused' : hour >= 23 || hour < 6 ? 'sleepy' : pick ? 'hungry' : 'happy',
    bite: pick ? { id: pick.id, text: pick.text, icon, symbol: sfSymbol(icon), min: FOOD[pick.size].min } : null,
    position: index + 1,
    left: list.length,
    focus,
    fedToday: s.stats?.lastVisit === dayKey(now) ? (s.stats?.todayEaten ?? 0) : 0,
  };
}
