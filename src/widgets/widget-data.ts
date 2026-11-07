import { sfSymbol } from '@/components/icon';
import { biteIcon } from '@/features/bites/bite-icon';
import { FOOD, plate } from '@/features/bites/logic';
import { hasPack } from '@/features/plus/catalog';
import { storage } from '@/lib/storage';
import type { PersistedState } from '@/state/schema';

export interface WidgetData {
  petName: string;
  bite: { id: string; text: string; symbol: string; min: number } | null;
  /** Start Kit: the widget starts 2 minutes in one tap (free widget only opens the app) */
  canStart: boolean;
  left: number;
}

/**
 * Reads the saved app state straight from MMKV. The widget task runs headless (the app may be
 * closed), so it cannot use the React store.
 */
export function readWidgetData(): WidgetData {
  let s: Partial<PersistedState> = {};
  try {
    const raw = storage.getString('app-state');
    if (raw) s = (JSON.parse(raw) as { state?: Partial<PersistedState> }).state ?? {};
  } catch {
    // broken or missing data: show the empty widget
  }
  const list = plate(s.bites ?? []);
  const first = list[0];
  return {
    petName: s.pet?.name ?? 'Bean',
    bite: first ? { id: first.id, text: first.text, symbol: sfSymbol(biteIcon(first.text, first.size)), min: FOOD[first.size].min } : null,
    canStart: hasPack(s.unlocked ?? [], 'startKit'),
    left: list.length,
  };
}
