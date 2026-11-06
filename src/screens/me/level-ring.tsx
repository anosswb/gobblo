import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import type { Mood } from '@/pet/pet';
import { Pet } from '@/pet/pet';
import type { PetColor } from '@/theme/tokens';
import { spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Level ring, Activity-ring style: a thick round-capped arc that closes as the pet grows,
 * with the pet standing inside. Fills once on open on the critically damped Apple spring.
 */
export function LevelRing({ progress, color, mood, stage, size = 132 }: { progress: number; color: PetColor; mood: Mood; stage: number; size?: number }) {
  const { colors, reduceMotion } = useTheme();
  const stroke = 14;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const p = useSharedValue(reduceMotion ? progress : 0);

  useEffect(() => {
    p.set(reduceMotion ? progress : withDelay(120, withSpring(progress, spring.apple)));
  }, [progress, reduceMotion, p]);

  const arc = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - Math.max(0.02, p.get())) }));

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primarySoft} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${C} ${C}`}
          animatedProps={arc}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Pet size={size * 0.5} color={color} mood={mood} stage={stage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
});
