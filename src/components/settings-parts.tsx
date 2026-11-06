import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

/** A titled group card (grouped-settings pattern, iOS HIG + Material). */
export function Section({ title, footer, children }: PropsWithChildren<{ title: string; footer?: string }>) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="caption" tone="ink2" style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>{children}</View>
      {footer ? (
        <Text variant="caption" tone="ink3" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

/** One row: label (+ hint) on the start side, control on the end side. */
export function Row({
  label,
  hint,
  right,
  onPress,
  last,
  stacked,
  danger,
}: {
  label: string;
  hint?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  /** put the control under the label (segmented controls) */
  stacked?: boolean;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const body = (
    <View style={[stacked ? styles.rowStacked : styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }]}>
      <View style={styles.rowText}>
        <Text variant="bodyBold" style={danger ? { color: colors.danger } : undefined}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" tone="ink3">
            {hint}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
  if (!onPress) return body;
  return (
    <PressScale pressedScale={0.99} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint} onPress={onPress}>
      {body}
    </PressScale>
  );
}

/** Wrapping choice chips (sounds, accents…). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string; swatch?: string }[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressScale
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            onPress={() => {
              haptics.select();
              onChange(o.value);
            }}
            style={[
              styles.chip,
              { backgroundColor: on ? colors.cardAlt : colors.card, borderColor: on ? colors.primary : colors.line },
            ]}>
            {o.swatch ? <View style={[styles.swatch, { backgroundColor: o.swatch }]} /> : null}
            <Text variant="caption" tone={on ? 'primary' : 'ink2'}>
              {o.label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}

/** − value + stepper (quiet hours). */
export function Stepper({
  value,
  onChange,
  format,
  min,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  min: number;
  max: number;
  label: string;
}) {
  const { colors } = useTheme();
  const btn = (delta: number, glyph: string) => (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${label} ${delta > 0 ? 'later' : 'earlier'}`}
      hitSlop={6}
      onPress={() => {
        haptics.select();
        const span = max - min + 1;
        onChange(((value - min + delta + span) % span) + min);
      }}
      style={[styles.stepBtn, { backgroundColor: colors.cardAlt }]}>
      <Text variant="bodyBold" tone="primary">
        {glyph}
      </Text>
    </PressScale>
  );
  return (
    <View style={styles.stepper}>
      {btn(-1, '−')}
      <Text variant="bodyBold" style={styles.stepValue} accessibilityLiveRegion="polite">
        {format(value)}
      </Text>
      {btn(1, '+')}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s },
  sectionTitle: { marginStart: space.xs, textTransform: 'lowercase' },
  footer: { marginStart: space.xs },
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.l },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m },
  rowStacked: { paddingVertical: space.m, gap: space.m },
  rowText: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: {
    minHeight: 40,
    paddingHorizontal: space.m,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
  },
  swatch: { width: 16, height: 16, borderRadius: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  stepBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 64, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
