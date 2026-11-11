import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/icon';
import { duration, easing } from '@/theme/motion';

/** How far a petting heart floats up (pt) and how long it lives (ms). */
export const HEART_RISE = 44;
export const HEART_MS = 900;

/**
 * One petting heart. It drives itself: floats up, fades out and then asks to be removed, so no
 * heart can be left hanging on screen (Anass's phone test: hearts stayed after the petting
 * stopped; they used to depend on a timer plus a layout exit animation). `fading` = the petting
 * stopped: fade out now. Reduce Motion: no float, only the fade.
 */
export function FloatHeart({
  x,
  top = 8,
  size = 20,
  color,
  fading,
  reduceMotion,
  onDone,
}: {
  x: number;
  top?: number;
  size?: number;
  color: string;
  fading: boolean;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  const t = useSharedValue(0);
  const hush = useSharedValue(1);

  useEffect(() => {
    // always runs to the end, even when the phone has animations turned off
    t.set(
      withTiming(1, { duration: HEART_MS, easing: easing.smoothOut, reduceMotion: ReduceMotion.Never }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(onDone);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one life per heart
  }, []);

  useEffect(() => {
    if (!fading) return;
    hush.set(
      withTiming(0, { duration: duration.quick, reduceMotion: ReduceMotion.Never }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(onDone);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fading]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    const life = p < 0.15 ? p / 0.15 : p > 0.55 ? (1 - p) / 0.45 : 1;
    return {
      opacity: life * hush.get(),
      transform: [{ translateY: reduceMotion ? 0 : -HEART_RISE * p }, { scale: reduceMotion ? 1 : 0.7 + 0.3 * Math.min(1, p * 4) }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.heart, { top, start: x }, style]}>
      <Icon name="heart" size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heart: { position: 'absolute' },
});
