import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { Pet } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space, type PetColor } from '@/theme/tokens';

const h = en.home;
const STAGE_H = 92;
const FOOD = 40;
const LOOP_MS = 2800;
const C = Extrapolation.CLAMP;

/**
 * The drag-to-feed guide (Anass 2026-11-08: "people need to know how to drag the food"). A tiny
 * looping demo instead of words alone: a hand holds the food, it lifts, arcs over to the pet, the
 * pet chomps. Shown above the bites until the first real drag or "Got it". Reduce Motion: a still
 * picture (food → pet). One shared value drives everything on the UI thread.
 */
export function DragGuide({
  petName,
  color,
  stage,
  hat,
  face,
  onDone,
}: {
  petName: string;
  color: PetColor;
  stage: number;
  hat: HatId;
  face: FaceId;
  onDone: () => void;
}) {
  const { colors, reduceMotion } = useTheme();
  const w = useSharedValue(0);
  const p = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    p.set(withRepeat(withTiming(1, { duration: LOOP_MS, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(p);
  }, [p, reduceMotion]);

  // food path: start tile (left) → arc → the pet's mouth (right)
  const food = useAnimatedStyle(() => {
    const t = p.get();
    const x0 = 24;
    const x1 = Math.max(x0, w.get() - 58);
    const x = interpolate(t, [0, 0.25, 0.62], [x0, x0, x1], C);
    const arc = interpolate(t, [0.25, 0.44, 0.62], [0, -30, 0], C);
    const scale = interpolate(t, [0.12, 0.18, 0.25, 0.6, 0.7], [1, 0.88, 1.14, 1.1, 0.2], C);
    const opacity = interpolate(t, [0.62, 0.7, 0.88, 0.96], [1, 0, 0, 1], C);
    return { opacity, transform: [{ translateX: x }, { translateY: STAGE_H / 2 - FOOD / 2 + arc }, { scale }] };
  });

  // the finger: arrives, holds, travels with the food, lifts away
  const hand = useAnimatedStyle(() => {
    const t = p.get();
    const x0 = 24;
    const x1 = Math.max(x0, w.get() - 58);
    const x = interpolate(t, [0, 0.12, 0.25, 0.62, 0.8], [x0 + 44, x0 + 16, x0 + 16, x1 + 16, x1 + 40], C);
    const arc = interpolate(t, [0.25, 0.44, 0.62], [0, -30, 0], C);
    const y = interpolate(t, [0, 0.12], [26, 14], C);
    const opacity = interpolate(t, [0, 0.08, 0.66, 0.8], [0, 1, 1, 0], C);
    const press = interpolate(t, [0.12, 0.18, 0.25], [1, 0.86, 1], C);
    return { opacity, transform: [{ translateX: x }, { translateY: STAGE_H / 2 + y + arc }, { scale: press }] };
  });

  // the pet opens wide while food is near, then a chomp bounce
  const pet = useAnimatedStyle(() => {
    const t = p.get();
    const scale = interpolate(t, [0.5, 0.62, 0.68, 0.76], [1, 1.06, 0.94, 1], C);
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View exiting={reduceMotion ? undefined : FadeOut.duration(duration.quick)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View
        style={[styles.stage, { backgroundColor: colors.fill }]}
        onLayout={(e) => w.set(e.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={h.guideBody(petName)}>
        {/* where the food comes from: a bite's food tile */}
        <View style={[styles.slot, { borderColor: colors.line }]} />
        <Animated.View style={[styles.petWrap, pet]}>
          <Pet size={66} still color={color} stage={stage} hat={hat} face={face} mood="hungry" />
        </Animated.View>
        {reduceMotion ? (
          <>
            <View style={[styles.food, styles.foodStill, { backgroundColor: colors.card }]}>
              <Icon name="foodSmall" size={20} color={colors.ink} />
            </View>
            <View style={styles.arrow}>
              <Icon name="chevron" size={22} weight="bold" color={colors.ink3} />
            </View>
          </>
        ) : (
          <>
            <Animated.View style={[styles.food, styles.abs, { backgroundColor: colors.card, shadowColor: colors.shadow }, food]}>
              <Icon name="foodSmall" size={20} color={colors.ink} />
            </Animated.View>
            <Animated.View style={[styles.abs, hand]} pointerEvents="none">
              <Icon name="hand" size={26} color={colors.ink} />
            </Animated.View>
          </>
        )}
      </View>
      <View style={styles.textRow}>
        <View style={styles.flex}>
          <Text variant="bodyBold">{h.guideTitle(petName)}</Text>
          <Text variant="subhead" tone="ink2">{h.guideBody(petName)}</Text>
        </View>
        <PressScale accessibilityRole="button" onPress={onDone} hitSlop={8} style={[styles.ok, { backgroundColor: colors.ink }]}>
          <Text variant="subhead" style={[styles.okText, { color: colors.bg }]}>{h.guideOk}</Text>
        </PressScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.m, gap: space.m },
  stage: { height: STAGE_H, borderRadius: radius.card - space.m, overflow: 'hidden' },
  slot: { position: 'absolute', start: 24, top: STAGE_H / 2 - FOOD / 2, width: FOOD, height: FOOD, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed' },
  petWrap: { position: 'absolute', end: 16, top: STAGE_H / 2 - 40 },
  abs: { position: 'absolute', start: 0, top: 0 },
  food: { width: FOOD, height: FOOD, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  foodStill: { position: 'absolute', start: 24, top: STAGE_H / 2 - FOOD / 2 },
  arrow: { position: 'absolute', start: 0, end: 0, top: STAGE_H / 2 - 11, alignItems: 'center' },
  textRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.xs },
  flex: { flex: 1, gap: 2 },
  ok: { minHeight: 36, paddingHorizontal: space.l, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  okText: { fontWeight: '600' },
});
