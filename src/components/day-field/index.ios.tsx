import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, tint } from '@expo/ui/swift-ui/modifiers';

import { useTheme } from '@/theme/theme-provider';

import { type DayFieldProps, maxDay, toDate, toKey } from './shared';

/** iPhone: the native SwiftUI calendar (graphical), any day from tomorrow on. */
export function DayField({ day, min, onChange, label }: DayFieldProps) {
  const { colors, scheme } = useTheme();
  return (
    <Host matchContents colorScheme={scheme}>
      <DatePicker
        title={label}
        selection={toDate(day)}
        range={{ start: toDate(min), end: toDate(maxDay(min)) }}
        displayedComponents={['date']}
        onDateChange={(d) => onChange(toKey(d))}
        modifiers={[datePickerStyle('graphical'), tint(colors.primaryInk)]}
      />
    </Host>
  );
}
