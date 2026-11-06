import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/text';
import { useTheme } from '@/theme/theme-provider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * The donut being eaten (docs/03 #8): the ring shrinks smoothly every frame on the UI thread
 * (not every second), the food in the middle shrinks 1 → 0.55 and turns −20°.
 * `left` = 0..1 of time left now; `msLeft` drives a linear run to 0. Paused = frozen.
 */
export function TimerRing({
  left,
  msLeft,
  running,
  runKey,
  emoji,
  size = 248,
}: {
  left: number;
  msLeft: number;
  running: boolean;
  /** changes on start / pause / resume / +5: the only moments the ring re-syncs to the clock */
  runKey: string;
  emoji: string;
  size?: number;
}) {
  const { colors, reduceMotion } = useTheme();
  const p = useSharedValue(left);
  const stroke = 18;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  useEffect(() => {
    cancelAnimation(p);
    p.set(left);
    if (running && msLeft > 0) p.set(withTiming(0, { duration: msLeft, easing: Easing.linear }));
    // re-sync only when the run changes, not on every clock tick (left/msLeft are read at that moment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.get()) }));
  const food = useAnimatedStyle(() =>
    reduceMotion ? {} : { transform: [{ scale: 0.55 + 0.45 * p.get() }, { rotate: `${(1 - p.get()) * -20}deg` }] },
  );

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.glassBorder} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.sun}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${C} ${C}`}
          animatedProps={ringProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Animated.View style={food}>
          <Text style={styles.emoji}>{emoji}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, lineHeight: 76 },
});
