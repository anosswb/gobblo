import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/text';
import type { DayBucket } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { spring, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const CHART_H = 120;

/**
 * Interactive week chart (docs/12 #11): bars grow from the bottom (spring 'fill', 40 ms stagger),
 * tap a bar to see that day. Bites or minutes. Today is highlighted. 7 plain views: height
 * animation is cheap here and keeps the rounded corners (scaleY would squash them).
 */
export function WeekChart({ days, metric }: { days: DayBucket[]; metric: 'bites' | 'minutes' }) {
  const todayIndex = Math.max(0, days.findIndex((d) => d.isToday));
  const [picked, setPicked] = useState(todayIndex);
  const max = Math.max(1, ...days.map((d) => d[metric]));
  const sel = days[picked] ?? days[0];

  return (
    <View style={styles.wrap}>
      <Text variant="subhead" tone="ink2" accessibilityLiveRegion="polite">
        {sel.isToday ? 'today' : sel.label}: {sel.bites} {sel.bites === 1 ? 'bite' : 'bites'} · {sel.minutes} min
      </Text>
      <View style={styles.bars} accessibilityRole="adjustable" accessibilityLabel={`this week, ${metric}`}>
        {days.map((d, i) => (
          <Pressable
            key={d.key}
            accessibilityRole="button"
            accessibilityLabel={`${d.label}: ${d.bites} bites, ${d.minutes} minutes`}
            onPress={() => {
              haptics.select();
              setPicked(i);
            }}
            style={styles.col}>
            <Bar value={d[metric] / max} index={i} active={i === picked} today={d.isToday} />
            <Text variant="caption" tone={i === picked ? 'primary' : 'ink3'}>
              {d.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Bar({ value, index, active, today }: { value: number; index: number; active: boolean; today: boolean }) {
  const { colors, reduceMotion } = useTheme();
  const h = useSharedValue(reduceMotion ? value : 0);
  useEffect(() => {
    h.set(reduceMotion ? value : withDelay(staggerDelay(index), withSpring(value, spring.fill)));
  }, [value, index, reduceMotion, h]);
  const style = useAnimatedStyle(() => ({ height: Math.max(6, h.get() * CHART_H) }));
  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.bar,
          { backgroundColor: active ? colors.primary : today ? colors.primarySoft : colors.fill },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.m },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: space.s },
  col: { flex: 1, alignItems: 'center', gap: space.xs, minHeight: 44 },
  track: { height: CHART_H, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: radius.row - 6 },
});
