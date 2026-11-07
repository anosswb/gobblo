import { biteIcon } from '@/features/bites/bite-icon';
import type { Size } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';

import { Icon } from './icon';

/** A bite's icon: what it is about (mail, laundry, gym…), else its size's food glyph. */
export function BiteIcon({ text, size, px = 22, color }: { text: string; size: Size; px?: number; color?: string }) {
  const { colors } = useTheme();
  return <Icon name={biteIcon(text, size)} size={px} color={color ?? colors.ink} />;
}
