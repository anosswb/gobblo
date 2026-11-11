import { hasPlus } from '@/features/plus/catalog';
import { levelOf, stageOfLevel } from '@/features/progress/logic';
import { petWeek } from '@/features/weekly/logic';
import type { Mood } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import { useAppStore } from '@/state/app-store';
import type { PetColor } from '@/theme/tokens';

import { COLORS, FACES, HATS, isUnlocked, ROOMS, type HomeMood, type Item, type RoomId } from './items';

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
}

/** Saved choice if it is (still) unlocked, else the free default. */
function pick<T extends string>(items: Item<T>[], saved: string, level: number, miy: boolean, fallback: T, week = 0): T {
  const it = items.find((i) => i.id === saved);
  return it && isUnlocked(it.unlock, level, miy, week) ? it.id : fallback;
}

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
  return {
    level,
    stage: stageOfLevel(level),
    color: pick(COLORS, pet.color, level, miy, 'caramel', week),
    hat: pick(HATS, pet.hat, level, miy, 'none', week),
    face: pick(FACES, pet.face ?? 'none', level, miy, 'none'),
    room: pick(ROOMS, pet.room ?? 'auto', level, miy, 'auto', week),
    homeMood: (pet.mood as Mood | 'auto' | undefined) ?? 'auto',
    plus: miy,
    week,
  };
}
