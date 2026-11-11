import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/text';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const N = 10;
const SPARK = 'M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10Z';

/**
 * Sparkle burst around the pet when it eats (rare tier: the delight budget lives here).
 * 10 sparks fly out on a strong ease-out, spin a little and fade; total < 800 ms.
 * Plays once per `id`. Reduce Motion: nothing (the pet's face already says it).
 */
export function Burst({ id, size = 220 }: { id: number; size?: number }) {
  const { colors, reduceMotion } = useTheme();
  if (reduceMotion || id === 0) return null;
  const tints = [colors.reward, colors.sun, colors.primary, colors.onPrimary];
  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size, marginStart: -size / 2, marginTop: -size / 2 }]}>
      {Array.from({ length: N }, (_, i) => (
        <Spark key={`${id}-${i}`} index={i} radius={size * (0.36 + (i % 3) * 0.06)} color={tints[i % tints.length]} />
      ))}
    </View>
  );
}

function Spark({ index, radius, color }: { index: number; radius: number; color: string }) {
  const t = useSharedValue(0);
  const angle = (index / N) * Math.PI * 2 + (index % 2 ? 0.2 : -0.1);
  const s = 0.6 + (index % 3) * 0.25;

  useEffect(() => {
    t.set(withDelay((index % 4) * 25, withTiming(1, { duration: 700, easing: Easing.bezier(0.23, 1, 0.32, 1) })));
  }, [index, t]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4,
      transform: [
        { translateX: Math.cos(angle) * radius * p },
        { translateY: Math.sin(angle) * radius * p },
        { scale: s * (0.6 + 0.4 * p) },
        { rotate: `${p * 90}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.spark, style]}>
      <Svg width={22} height={22} viewBox="-11 -11 22 22">
        <Path d={SPARK} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * "+2 ✦" lifting off the pet right after the chomp: the reward is shown where it was earned,
 * not in a toast. Plays once per `id`. Reduce Motion: it fades in place.
 * `top` / `rise` (pt) let it start at the paws and lift further (Home's happy dive).
 */
export function SparkGain({ id, amount, top, rise = 28 }: { id: number; amount: number; top?: number; rise?: number }) {
  const { colors, reduceMotion } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    if (id === 0) return;
    t.set(0);
    t.set(withTiming(1, { duration: duration.verySlow * 3, easing: easing.strongOut }));
  }, [id, t]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p === 0 ? 0 : p < 0.15 ? p / 0.15 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3,
      transform: [{ translateY: reduceMotion ? 0 : -rise * p }, { scale: reduceMotion ? 1 : 0.9 + 0.1 * Math.min(1, p * 4) }],
    };
  });
  if (id === 0 || amount <= 0) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.gain, { backgroundColor: colors.reward }, top === undefined ? null : { top }, style]} accessibilityLiveRegion="polite" accessibilityLabel={`plus ${amount} sparks`}>
      <Text variant="bodyBold" style={{ color: colors.onReward }}>+{amount} ✦</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gain: { position: 'absolute', top: -space.xl, alignSelf: 'center', paddingHorizontal: space.m, height: 32, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  wrap: { position: 'absolute', top: '50%', start: '50%', alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute' },
});
