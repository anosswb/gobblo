import { hasPlus } from '@/features/plus/catalog';
import { levelOf, stageOfLevel } from '@/features/progress/logic';
import { petWeek } from '@/features/weekly/logic';
import type { Mood } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import { useAppStore } from '@/state/app-store';
import type { PetColor } from '@/theme/tokens';

import { COLORS, FACES, HATS, ROOMS, type HomeMood, type Item, type RoomId } from './items';
import { itemOpen, type ShopCtx } from './shop';

export interface Look {
  level: number;
  stage: number;
  color: PetColor;
  hat: HatId;
  face: FaceId;
  room: RoomId;
  homeMood: HomeMood;
  plus: boolean;
  /** pet week now (weekly surprise colours) */
  week: number;
  /** all-time sparks (stats.total), for the spark shop */
  total: number;
  /** single items bought with sparks (pet.owned, "slot:id") */
  owned: readonly string[];
}

/** Saved choice if it is (still) yours, else the free default. */
function pick<T extends string>(items: Item<T>[], saved: string, ctx: ShopCtx, fallback: T): T {
  const it = items.find((i) => i.id === saved);
  return it && itemOpen(it, ctx) ? it.id : fallback;
}

const NO_OWNED: readonly string[] = [];

/** Everything that decides how the pet looks right now (all screens use this). */
export function useLook(): Look {
  const pet = useAppStore((s) => s.pet);
  const total = useAppStore((s) => s.stats.total);
  const unlocked = useAppStore((s) => s.unlocked);
  const level = levelOf(total);
  const miy = hasPlus(unlocked);
  const firstOpen = useAppStore((s) => s.settings.firstOpen);
  // the pet week only changes at 4 am; read on render (Home re-renders on foreground)
  const week = petWeek(firstOpen, new Date());
  const owned = pet.owned ?? NO_OWNED;
  const ctx: ShopCtx = { level, total, plus: miy, week, owned };
  return {
    level,
    stage: stageOfLevel(level),
    color: pick(COLORS, pet.color, ctx, 'caramel'),
    hat: pick(HATS, pet.hat, ctx, 'none'),
    face: pick(FACES, pet.face ?? 'none', ctx, 'none'),
    room: pick(ROOMS, pet.room ?? 'auto', ctx, 'auto'),
    homeMood: (pet.mood as Mood | 'auto' | undefined) ?? 'auto',
    plus: miy,
    week,
    total,
    owned,
  };
}
