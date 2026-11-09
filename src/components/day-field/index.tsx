import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/theme/theme-provider';
import { font, radius, space } from '@/theme/tokens';

import { type DayFieldProps, maxDay } from './shared';

/**
 * Web (preview only): the browser's own date input. Phones use the native calendars in
 * index.ios.tsx / index.android.tsx.
 */
export function DayField({ day, min, onChange, label }: DayFieldProps) {
  const { colors, scheme } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.primarySoft }]}>
      <Icon name="calendar" size={16} color={colors.primary} />
      {createElement('input', {
        type: 'date',
        value: day,
        min,
        max: maxDay(min),
        'aria-label': label,
        onChange: (e: { target: { value: string } }) => e.target.value && onChange(e.target.value),
        style: { border: 'none', background: 'transparent', color: colors.primary, ...font('body', '600'), fontSize: 16, colorScheme: scheme, minHeight: 44 },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.l, borderRadius: radius.chip, alignSelf: 'flex-start' },
});
