import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/text';
import { spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Screenrove "sliding number" (motion-primitives): each digit is a 0–9 column that rolls on
 * a light spring (280/18/0.3, no bounce), tabular so nothing shifts. Reduce Motion: swaps.
 */
export function SlidingNumber({ value, tone = 'onReward', big = false }: { value: number; tone?: 'onReward' | 'ink' | 'onFocus'; big?: boolean }) {
  const digits = String(Math.max(0, Math.floor(value))).split('').map(Number);
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={String(value)}>
      {digits.map((d, i) => (
        <Digit key={digits.length - i} d={d} tone={tone} big={big} />
      ))}
    </View>
  );
}

function Digit({ d, tone, big }: { d: number; tone: 'onReward' | 'ink' | 'onFocus'; big: boolean }) {
  const { reduceMotion } = useTheme();
  const H = big ? 41 : 22;
  const y = useSharedValue(-d * H);
  useEffect(() => {
    y.set(reduceMotion ? -d * H : withSpring(-d * H, spring.digit));
  }, [d, H, reduceMotion, y]);
  const col = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return (
    <View style={[styles.cell, { height: H }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <Animated.View style={col}>
        {DIGITS.map((n) => (
          <Text key={n} variant={big ? 'title' : 'bodyBold'} tone={tone} style={[styles.digit, { height: H, lineHeight: H }]}>
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { overflow: 'hidden' },
  digit: { fontVariant: ['tabular-nums'] },
});
