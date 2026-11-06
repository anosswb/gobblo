import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { duration, easing, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';

const W = 51;
const H = 31;
const KNOB = 27;
const STRETCH = 7; // the knob widens while your finger is on it, like UISwitch
const P = 2;

/**
 * iOS switch, same on Android so the app feels like one object: 51×31 track, green when on,
 * knob slides on a critically damped spring and stretches toward the far side while pressed.
 * No animation on mount. Reduce Motion: instant.
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
  const on = useSharedValue(value ? 1 : 0);
  const press = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    const to = value ? 1 : 0;
    if (!mounted.current || reduceMotion) {
      mounted.current = true;
      on.set(to);
      return;
    }
    on.set(withSpring(to, spring.apple));
  }, [value, reduceMotion, on]);

  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.get(), [0, 1], [colors.fill2, colors.success]) }));
  const knob = useAnimatedStyle(() => {
    const w = KNOB + press.get() * STRETCH;
    const x = P + on.get() * (W - P * 2 - w);
    return { width: w, transform: [{ translateX: x }] };
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPressIn={() => {
        if (!reduceMotion) press.set(withTiming(1, { duration: duration.quick, easing: easing.strongOut }));
      }}
      onPressOut={() => press.set(reduceMotion ? 0 : withTiming(0, { duration: duration.fast, easing: easing.strongOut }))}
      onPress={() => {
        haptics.light();
        play('tick');
        onChange(!value);
      }}
      style={{ opacity: disabled ? 0.4 : 1 }}>
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, { backgroundColor: colors.onPrimary, shadowColor: colors.focusBottom }, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    start: 0,
    height: KNOB,
    borderRadius: KNOB / 2,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
