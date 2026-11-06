import { useAppStore } from '@/state/app-store';

import { stageOf } from './logic';

/** The pet's evolution stage (0–3) from all-time sparks. */
export const usePetStage = () => useAppStore((s) => stageOf(s.stats.total));
