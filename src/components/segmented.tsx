import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius } from '@/theme/tokens';

type Option<T extends string> = { value: T; label: string };

const PAD = 3;

/**
 * iOS 26 segmented control: capsule track (tertiary fill), a raised thumb that slides on a
 * critically damped Apple spring, labels stay ink (selection is shown by the thumb, not colour).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
}) {
  const { colors, reduceMotion } = useTheme();
  const [w, setW] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segW = (w - PAD * 2) / options.length;
  const x = useSharedValue(0);

  useEffect(() => {
    if (!segW) return;
    x.set(reduceMotion ? index * segW : withSpring(index * segW, spring.apple));
  }, [index, segW, reduceMotion, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[styles.wrap, { backgroundColor: colors.fill }]}>
      {segW > 0 && <Animated.View style={[styles.thumb, { width: segW, backgroundColor: colors.thumb, shadowColor: colors.shadow }, thumb]} />}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (selected) return;
              haptics.select();
              onChange(o.value);
            }}
            style={styles.seg}>
            <Text variant="caption" style={[styles.label, selected && styles.on]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.chip, padding: PAD, height: 40 },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    start: PAD,
    borderRadius: radius.chip,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 34 },
  label: { fontSize: 14 },
  on: { fontWeight: '600' },
});
