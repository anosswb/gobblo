import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/theme/theme-provider';
import { fonts, MAX_FONT_SCALE, typeScale } from '@/theme/tokens';

type Variant = 'title' | 'heading' | 'body' | 'bodyBold' | 'caption' | 'timer';
type Tone = 'ink' | 'ink2' | 'ink3' | 'primary' | 'onPrimary' | 'onReward';

type Props = TextProps & { variant?: Variant; tone?: Tone };

/** The only text component. 4 sizes + timer numerals (docs/02). */
export function Text({ variant = 'body', tone = 'ink', style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[styles[variant], { color: colors[tone] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: typeScale.xl, letterSpacing: -0.5, lineHeight: 38 },
  heading: { fontFamily: fonts.display, fontSize: typeScale.l, letterSpacing: -0.3, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: typeScale.m, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: typeScale.m, lineHeight: 22 },
  caption: { fontFamily: fonts.bodyBold, fontSize: typeScale.s, lineHeight: 18 },
  timer: {
    fontFamily: fonts.displaySemi,
    fontSize: typeScale.timer,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
});
