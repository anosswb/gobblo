import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Chips, TimeStepper } from '@/components/settings-parts';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { Toggle } from '@/components/toggle';
import { formatEndsAt } from '@/features/focus/timer';
import { WHENS, type When } from '@/features/bites/when';
import { inQuietHours } from '@/features/nudges/plan';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { haptics } from '@/lib/haptics';
import { radius, space } from '@/theme/tokens';

const w = en.when;
export const WHEN_LABEL: Record<When, string> = { today: w.today, tomorrow: w.tomorrow, week: w.week, someday: w.someday };

/** "5:00 pm" / "17:00" for minutes since midnight, following the 24 h setting. */
export function clockLabel(minutes: number, clock24h: boolean) {
  const d = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return formatEndsAt(d.getTime(), clock24h);
}

/**
 * The "when" picker: Today / Tomorrow / This week / Someday, then an optional time for Today and
 * Tomorrow. The hint says honestly whether a ping will come (bite times skip the nudge cap, never quiet hours).
 * Used by the Home add row and the start sheet.
 */
export function WhenPicker({
  when,
  minutes,
  onWhen,
  onTime,
}: {
  when: When;
  /** minutes since midnight, or null for no time */
  minutes: number | null;
  onWhen: (w: When) => void;
  onTime: (m: number | null) => void;
}) {
  const settings = useAppStore((s) => s.settings);
  const { colors } = useTheme();
  const timed = when === 'today' || when === 'tomorrow';
  const hint =
    minutes === null
      ? null
      : inQuietHours(Math.floor(minutes / 60), settings.quietStart, settings.quietEnd)
        ? w.hintQuiet
        : w.hintOk;

  return (
    <View style={styles.wrap}>
      <Chips<When> accessibilityLabel={w.title} value={when} onChange={onWhen} options={WHENS.map((v) => ({ value: v, label: WHEN_LABEL[v] }))} />
      {timed ? (
        <View style={styles.timeRow}>
          <Text variant="body" style={styles.flex}>{w.addTime}</Text>
          <Toggle
            value={minutes !== null}
            onChange={(on) => onTime(on ? defaultMinutes(when, settings.quietStart, settings.quietEnd) : null)}
            accessibilityLabel={w.addTime}
          />
        </View>
      ) : null}
      {timed && minutes !== null ? (
        <Animated.View entering={FadeIn.duration(duration.quick)} exiting={FadeOut.duration(duration.quick)} style={styles.stepper}>
          <View style={styles.presets}>
            {PRESETS.map((m) => {
              const on = m === minutes;
              return (
                <PressScale
                  key={m}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={clockLabel(m, settings.clock24h)}
                  hitSlop={6}
                  onPress={() => {
                    haptics.select();
                    onTime(m);
                  }}
                  style={[styles.preset, { backgroundColor: on ? colors.primarySoft : colors.fill }]}>
                  <Text variant="caption" tone={on ? 'primary' : 'ink'} style={styles.presetText}>{clockLabel(m, settings.clock24h)}</Text>
                </PressScale>
              );
            })}
          </View>
          <TimeStepper label={w.time} minutes={minutes} onChange={onTime} format={(m) => clockLabel(m, settings.clock24h)} />
          {hint ? <Text variant="caption" tone="ink2">{hint}</Text> : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Quick picks (fine-tune with − / +): morning, noon, after school/work, evening. */
const PRESETS = [9 * 60, 12 * 60, 16 * 60, 19 * 60];

/** Today: the next full hour; tomorrow or a quiet hour: one hour after quiet hours end (9:00 by default). */
function defaultMinutes(when: When, quietStart: number, quietEnd: number) {
  const d = new Date(Date.now() + 30 * 60_000);
  const next = (d.getHours() + 1) % 24;
  if (when === 'today' && !inQuietHours(next, quietStart, quietEnd)) return next * 60;
  return ((quietEnd + 1) % 24) * 60;
}

const styles = StyleSheet.create({
  wrap: { gap: space.m },
  flex: { flex: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 44 },
  stepper: { gap: space.s, alignItems: 'flex-start' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  preset: { minHeight: 32, paddingHorizontal: space.m, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  presetText: { fontWeight: '600' },
});
