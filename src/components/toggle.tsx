import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useTheme } from '@/theme/theme-provider';

const W = 52;
const H = 32;
const THUMB = 24;
const TRAVEL = W - THUMB - 8;
const OVERSHOOT = 2; // transitions.dev toggle ov1 (1px on a 14.66px travel), scaled to our 20px track
const EASE = Easing.bezier(0.34, 1.35, 0.64, 1);

/**
 * Switch from the transitions.dev "toggle" recipe: 350 ms, thumb overshoots past the end then
 * settles, track colour swaps instantly. No animation on mount. Reduce Motion: instant.
 */
export function Toggle({
  value,
  onChange,
  accessibilityLabel,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  const { colors, reduceMotion } = useTheme();
  const x = useSharedValue(value ? TRAVEL : 0);
  const mounted = useRef(false);

  useEffect(() => {
    const to = value ? TRAVEL : 0;
    if (!mounted.current || reduceMotion) {
      mounted.current = true;
      x.set(to);
      return;
    }
    const over = value ? to + OVERSHOOT : to - OVERSHOOT;
    x.set(
      withSequence(
        withTiming(over, { duration: 192, easing: EASE }), // 0 → 55 %
        withTiming(to, { duration: 88, easing: EASE }), // 55 → 80 %
        withTiming(to, { duration: 70 }), // settle to 350 ms
      ),
    );
  }, [value, reduceMotion, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => {
        haptics.light();
        play('tick');
        onChange(!value);
      }}
      style={[styles.track, { backgroundColor: value ? colors.primary : colors.cardAlt, opacity: disabled ? 0.5 : 1 }]}>
      <Animated.View style={[styles.thumb, { backgroundColor: colors.card, shadowColor: colors.shadow }, thumb]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, padding: 4, justifyContent: 'center' },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
