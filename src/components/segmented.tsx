import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

type Option<T extends string> = { value: T; label: string };

/**
 * Segmented control. Thumb moves on Screenrove's interior-segmented-control spring
 * (520/34/0.45, ~410 ms settle, no bounce). Phase 5 adds the inverted-label layer.
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
  const segW = (w - 8) / options.length;
  const x = useSharedValue(0);

  useEffect(() => {
    if (!segW) return;
    x.set(reduceMotion ? index * segW : withSpring(index * segW, spring.firm));
  }, [index, segW, reduceMotion, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[styles.wrap, { backgroundColor: colors.cardAlt }]}>
      {segW > 0 && <Animated.View style={[styles.thumb, { width: segW, backgroundColor: colors.primary }, thumb]} />}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <PressScale
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                haptics.select();
                onChange(o.value);
              }
            }}
            style={styles.seg}>
            <Text variant="bodyBold" tone={selected ? 'onPrimary' : 'ink2'}>
              {o.label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.button, padding: space.xs, minHeight: 52 },
  thumb: { position: 'absolute', top: space.xs, bottom: space.xs, start: space.xs, borderRadius: 14 },
  seg: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
