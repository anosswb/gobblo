import { useEffect, useRef, type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/theme-provider';
import { radius, space, tiles, type TileColor } from '@/theme/tokens';

/**
 * iOS inset-grouped list (Settings, Reminders). Header and footer in footnote grey, rows on
 * one rounded card, separators inset to the text so the group reads as one object.
 */
export function Section({ title, footer, children }: PropsWithChildren<{ title?: string; footer?: string }>) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="caption" tone="ink2" style={styles.pad} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>{children}</View>
      {footer ? (
        <Text variant="caption" tone="ink2" style={styles.pad}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

/** One row: label (+ hint) on the start side, control on the end side. Tappable rows highlight. */
export function Row({
  label,
  hint,
  right,
  onPress,
  last,
  stacked,
  danger,
  leading,
  value,
  hideLabel,
}: {
  label: string;
  hint?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  /** put the control under the label (segmented controls, chips) */
  stacked?: boolean;
  danger?: boolean;
  /** an icon tile or emoji on the start side */
  leading?: ReactNode;
  /** current value shown before the chevron (navigation rows, iOS style) */
  value?: string;
  /** stacked control under a section header that already names it: don't print the name twice */
  hideLabel?: boolean;
}) {
  const { colors } = useTheme();
  const body = (pressed = false) => (
    <View style={[styles.rowWrap, pressed && { backgroundColor: colors.fill }]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={[stacked ? styles.rowStacked : styles.row, styles.flex]}>
        <View style={stacked ? undefined : styles.rowText}>
          {hideLabel && stacked ? null : (
            <Text variant="body" tone={danger ? 'danger' : 'ink'}>
              {label}
            </Text>
          )}
          {hint ? (
            <Text variant="caption" tone="ink2">
              {hint}
            </Text>
          ) : null}
        </View>
        {right ?? (onPress && !danger ? (
          <View style={styles.valueRow}>
            {value ? (
              <Text variant="body" tone="ink2" numberOfLines={1} style={styles.value}>
                {value}
              </Text>
            ) : null}
            <Icon name="chevron" size={14} weight="bold" color={colors.ink3} />
          </View>
        ) : null)}
        {!last ? <View style={[styles.sep, { backgroundColor: colors.line }]} /> : null}
      </View>
    </View>
  );
  if (!onPress) return body();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label} accessibilityHint={hint} onPress={onPress}>
      {({ pressed }) => body(pressed)}
    </Pressable>
  );
}

/** A small rounded-square icon tile, like iOS Settings rows. */
export function IconTile({ name, color }: { name: IconName; color: TileColor }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: tiles[color] }]}>
      <Icon name={name} size={16} color={colors.onPrimary} />
    </View>
  );
}

/** Wrapping capsule choices (sounds, tints…). Selected = tinted. */
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
              if (on) return;
              haptics.select();
              onChange(o.value);
            }}
            style={[styles.chip, { backgroundColor: on ? colors.primarySoft : colors.fill }]}>
            {o.swatch ? (
              <View style={[styles.swatch, { backgroundColor: o.swatch, borderColor: on ? colors.card : 'transparent' }]} />
            ) : null}
            <Text variant="subhead" tone={on ? 'primary' : 'ink'} style={on ? styles.chipOn : undefined}>
              {o.label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}

/** iOS stepper: value, then a − | + capsule. Wraps around (hours, minutes). */
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
  const step = (delta: number) => {
    haptics.select();
    const span = max - min + 1;
    onChange(((value - min + delta + span) % span) + min);
  };
  return (
    <View style={styles.stepper}>
      <Text variant="bodyBold" style={styles.stepValue} accessibilityLiveRegion="polite">
        {format(value)}
      </Text>
      <View style={[styles.stepPill, { backgroundColor: colors.fill }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} earlier`} hitSlop={4} onPress={() => step(-1)} style={styles.stepBtn}>
          <Text variant="heading">−</Text>
        </Pressable>
        <View style={[styles.stepSep, { backgroundColor: colors.line }]} />
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} later`} hitSlop={4} onPress={() => step(1)} style={styles.stepBtn}>
          <Text variant="heading">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * One time capsule: − 11:00 am +. Steps 5 min; hold to repeat (faster after a moment),
 * one selection haptic per step. Wraps around midnight.
 */
export function TimeStepper({
  minutes,
  onChange,
  format,
  label,
}: {
  /** minutes since midnight */
  minutes: number;
  onChange: (m: number) => void;
  format: (m: number) => string;
  label: string;
}) {
  const { colors } = useTheme();
  const latest = useRef(minutes);
  useEffect(() => {
    latest.current = minutes;
  }, [minutes]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const step = (delta: number) => {
    haptics.select();
    const next = (((latest.current + delta) % 1440) + 1440) % 1440;
    latest.current = next;
    onChange(next);
  };
  const hold = (delta: number) => {
    let n = 0;
    const tick = () => {
      step(delta);
      n += 1;
      timer.current = setTimeout(tick, n > 6 ? 60 : 140);
    };
    timer.current = setTimeout(tick, 380);
  };
  const btn = (delta: number, glyph: string, a11y: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${a11y}`}
      hitSlop={4}
      onPress={() => step(delta)}
      // a hold becomes a long press before the first repeat, so release never adds an extra step
      delayLongPress={350}
      onLongPress={() => undefined}
      onPressIn={() => hold(delta)}
      onPressOut={stop}
      style={styles.stepBtn}>
      <Text variant="heading">{glyph}</Text>
    </Pressable>
  );
  return (
    <View style={[styles.stepPill, styles.timePill, { backgroundColor: colors.fill }]}>
      {btn(-5, '−', '5 minutes earlier')}
      <Text variant="bodyBold" style={styles.timeValue} accessibilityLiveRegion="polite" accessibilityLabel={`${label}: ${format(minutes)}`}>
        {format(minutes)}
      </Text>
      {btn(5, '+', '5 minutes later')}
    </View>
  );
}

const styles = StyleSheet.create({
  timePill: { height: 40 },
  timeValue: { minWidth: 86, textAlign: 'center', fontVariant: ['tabular-nums'] },
  flex: { flex: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, maxWidth: '55%' },
  value: { flexShrink: 1 },
  section: { gap: space.s - 2 },
  pad: { paddingHorizontal: space.l },
  card: { borderRadius: radius.card, overflow: 'hidden' },
  rowWrap: { flexDirection: 'row', alignItems: 'center', paddingStart: space.l },
  leading: { marginEnd: space.m },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m - 2, paddingEnd: space.l },
  rowStacked: { paddingVertical: space.m, gap: space.m, paddingEnd: space.l },
  rowText: { flex: 1, gap: 1 },
  sep: { position: 'absolute', start: 0, end: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  tile: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { minHeight: 36, paddingHorizontal: space.m + 2, borderRadius: radius.chip, flexDirection: 'row', alignItems: 'center', gap: space.s },
  chipOn: { fontWeight: '600' },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  stepValue: { minWidth: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
  stepPill: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.chip, height: 34 },
  stepBtn: { width: 46, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepSep: { width: StyleSheet.hairlineWidth * 2, height: 18 },
});
