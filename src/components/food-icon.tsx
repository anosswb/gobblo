import { FOOD } from '@/features/bites/logic';
import type { Size } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';

import { Icon } from './icon';

/** A bite's size as a food glyph (SF Symbols on iOS, Phosphor elsewhere). No emoji in the UI. */
export function FoodIcon({ size, px = 22, color }: { size: Size; px?: number; color?: string }) {
  const { colors } = useTheme();
  return <Icon name={FOOD[size].icon} size={px} color={color ?? colors.ink} />;
}
