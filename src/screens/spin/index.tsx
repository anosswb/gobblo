import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { FOOD, plate } from '@/features/bites/logic';
import { buildSlices, sliceAt, spinTarget, type Slice } from '@/features/spin/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { Wheel } from './wheel';

const t = en.spin;

/**
 * Spin (docs/01 §6): for choice paralysis. Up to 8 slices from your bites, padded with
 * 2-minute snacks. Ticks + haptic ticks slow down with the wheel; result → start 2 min.
 */
export function SpinScreen() {
  const { colors, reduceMotion } = useTheme();
  const { width } = useWindowDimensions();
  const bites = useAppStore((s) => s.bites);
  const startFocus = useAppStore((s) => s.startFocus);
  const slices = buildSlices(plate(bites), (s) => FOOD[s].emoji);
  const size = Math.min(340, width - space.gutter * 2);

  const rotation = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Slice | null>(null);

  const tick = () => {
    haptics.select();
    play('tick');
  };
  // a tick each time a slice edge passes the pointer
  useAnimatedReaction(
    () => sliceAt(rotation.get(), slices.length),
    (now, prev) => {
      if (prev !== null && now !== prev) scheduleOnRN(tick);
    },
    [slices.length],
  );

  const land = (winner: Slice) => {
    setSpinning(false);
    setResult(winner);
    haptics.success();
    play('spark');
  };

  const spin = () => {
    if (spinning) return;
    const winner = Math.floor(Math.random() * slices.length);
    const target = spinTarget(rotation.get(), slices.length, winner, reduceMotion ? 1 : 5, Math.random());
    const picked = slices[winner];
    setSpinning(true);
    setResult(null);
    haptics.medium();
    rotation.set(
      withTiming(target, { duration: reduceMotion ? duration.slow * 2 : duration.spin, easing: easing.spin }, (done) => {
        if (done) scheduleOnRN(land, picked);
      }),
    );
  };

  const start = () => {
    if (!result) return;
    startFocus({ id: result.biteId, text: result.text, size: result.size }, 2, '2min');
    haptics.medium();
    play('spark');
    router.push('/focus');
    setTimeout(() => toast(en.focus.started), duration.slow);
  };

  const onlySnacks = slices.every((s) => !s.biteId);

  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="title">{t.title}</Text>
        <Text tone="ink2">{t.sub}</Text>
      </View>

      <View style={styles.wheelWrap} accessibilityLabel={t.wheelLabel(slices.length)}>
        <Wheel slices={slices} size={size} rotation={rotation} />
        <View style={styles.pointer} pointerEvents="none">
          <Svg width={34} height={30}>
            <Path d="M17 30 L3 4 Q17 -2 31 4 Z" fill={colors.ink} />
          </Svg>
        </View>
      </View>

      {onlySnacks ? <Text variant="caption" tone="ink2" style={styles.center}>{t.onlySnacks}</Text> : null}

      {result ? (
        <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text variant="caption" tone="primary">{t.says}</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text variant="heading" style={styles.flex}>{result.text}</Text>
          </View>
          {!result.biteId ? <Text variant="caption" tone="ink2">{t.snack}</Text> : null}
          <PressScale accessibilityRole="button" onPress={start}
            style={[styles.btn, { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep }]}>
            <Text variant="bodyBold" tone="onReward">{t.start}</Text>
          </PressScale>
          <PressScale accessibilityRole="button" onPress={spin} style={styles.link}>
            <Text variant="bodyBold" tone="primary">{t.again}</Text>
          </PressScale>
        </Animated.View>
      ) : (
        <PressScale accessibilityRole="button" disabled={spinning} onPress={spin}
          style={[styles.btn, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep, opacity: spinning ? 0.6 : 1 }]}>
          <Text variant="bodyBold" tone="onPrimary">{spinning ? t.spinning : t.spin}</Text>
        </PressScale>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  head: { gap: space.xs },
  wheelWrap: { alignItems: 'center', paddingTop: space.m },
  pointer: { position: 'absolute', top: 0, alignSelf: 'center' },
  card: { borderRadius: radius.card, borderWidth: 2, padding: space.xl, gap: space.m },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  resultEmoji: { fontSize: 34, lineHeight: 42 },
  btn: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.l, borderBottomWidth: 5 },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: space.l },
});
