import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/theme-provider';
import { font, MAX_FONT_SCALE, tracking, typeScale } from '@/theme/tokens';

/**
 * Apple text styles. Hierarchy comes from weight + size + leading as a set (WWDC20
 * "Details of UI typography"): tight leading on big text, comfortable on body.
 * title = Large Title (rounded), heading = Title 3 (rounded), bodyBold = Headline,
 * subhead = Subheadline, caption = Footnote, label = small semibold caps-free label.
 */
type Variant = 'title' | 'title2' | 'heading' | 'body' | 'bodyBold' | 'subhead' | 'caption' | 'label' | 'timer';
type Tone = 'ink' | 'ink2' | 'ink3' | 'primary' | 'onPrimary' | 'onReward' | 'onFocus' | 'onFocus2' | 'roomInk' | 'roomInk2' | 'danger';

type Props = TextProps & { variant?: Variant; tone?: Tone };

export function Text({ variant = 'body', tone = 'ink', style, ...rest }: Props) {
  const { colors } = useTheme();
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...rest} style={[styles[variant], { color: colors[tone] }, style]} />;
}

const t = (size: number, lineHeight: number, f: TextStyle): TextStyle => ({ ...f, fontSize: size, lineHeight, letterSpacing: tracking(size) });

const styles = StyleSheet.create({
  title: t(typeScale.largeTitle, 41, font('display', '800')),
  title2: t(typeScale.title2, 28, font('display', '700')),
  heading: t(typeScale.title3, 25, font('display', '700')),
  body: t(typeScale.body, 22, font('body', '400')),
  bodyBold: t(typeScale.body, 22, font('body', '600')),
  subhead: t(typeScale.subhead, 20, font('body', '400')),
  caption: t(typeScale.footnote, 18, font('body', '500')),
  label: t(12, 16, font('body', '600')),
  timer: { ...t(typeScale.timer, 84, font('display', '600')), fontVariant: ['tabular-nums'] },
});
