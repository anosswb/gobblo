import type { ReactNode, Ref } from 'react';
import { Pressable, type HostInstance, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration, easing, scale as scales } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  ref?: Ref<HostInstance>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Press feedback: scale 0.97 in 80 ms (Screenrove rule), instant under Reduce Motion. */
export function PressScale({ children, style, pressedScale = scales.press, onPressIn, onPressOut, ...rest }: Props) {
  const { reduceMotion } = useTheme();
  const s = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (!reduceMotion) s.set(withTiming(pressedScale, { duration: duration.micro, easing: easing.smoothOut }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.set(withTiming(1, { duration: duration.quick, easing: easing.smoothOut }));
        onPressOut?.(e);
      }}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}
