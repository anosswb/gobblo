import { DatePickerDialog, Host } from '@expo/ui/jetpack-compose';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { dayLabel, type DayFieldProps, maxDay, toDate, toKey } from './shared';

/** Android: a date button that opens the native Material 3 calendar dialog. */
export function DayField({ day, min, onChange, label }: DayFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${dayLabel(day)}`}
        onPress={() => {
          haptics.select();
          setOpen(true);
        }}
        style={[styles.button, { backgroundColor: colors.primarySoft }]}>
        <Icon name="calendar" size={16} color={colors.primaryInk} />
        <Text variant="bodyBold" tone="primary">{dayLabel(day)}</Text>
      </PressScale>
      {open ? (
        <Host matchContents>
          <DatePickerDialog
            initialDate={toDate(day).toISOString()}
            selectableDates={{ start: toDate(min), end: toDate(maxDay(min)) }}
            color={colors.primaryInk}
            confirmButtonLabel={en.when.pickOk}
            dismissButtonLabel={en.when.pickCancel}
            onDateSelected={(d) => {
              // Material hands back UTC midnight: read the calendar day in UTC
              onChange(toKey(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())));
              setOpen(false);
            }}
            onDismissRequest={() => setOpen(false)}
          />
        </Host>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.chip },
});
