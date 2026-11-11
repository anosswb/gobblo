import { hasPlus } from '@/features/plus/catalog';
import { levelOf } from '@/features/progress/logic';
import { petWeek } from '@/features/weekly/logic';
import { track } from '@/lib/analytics';
import { useAppStore } from '@/state/app-store';

import type { Item } from './items';
import { buy, type BuyResult, type ShopCtx } from './shop';

/** The shop context from the saved state right now (outside React too). */
export function shopCtxNow(now = new Date()): ShopCtx {
  const st = useAppStore.getState();
  return {
    level: levelOf(st.stats.total),
    total: st.stats.total,
    plus: hasPlus(st.unlocked),
    week: petWeek(st.settings.firstOpen, now),
    owned: st.pet.owned ?? [],
  };
}

/**
 * Buy one Closet item with sparks and wear it. Only stats.sparks goes down: stats.total
 * (the level) is never touched, so spending can never lower the level.
 */
export function buyItemNow(item: Item): BuyResult {
  const st = useAppStore.getState();
  const r = buy(item, shopCtxNow(), st.stats.sparks);
  if (!r.ok) return r;
  useAppStore.setState({
    stats: { ...st.stats, sparks: r.sparks },
    pet: { ...st.pet, owned: r.owned, [item.slot]: item.id },
  });
  track('closet_item_got', { slot: item.slot, how: 'sparks' });
  return r;
}
