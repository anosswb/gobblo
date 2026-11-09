import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { useLook } from '@/features/closet/use-look';
import type { DemoKind } from '@/i18n/guides.en';
import { Pet, type Mood } from '@/pet/pet';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const H = 132;
const TILE = 40;
const C = Extrapolation.CLAMP;
/** one loop per demo; long enough to read, short enough to feel alive */
const LOOP_MS: Record<DemoKind, number> = { list: 2600, drag: 2800, timer: 3200, sparkle: 2400, tap: 2200, shake: 1800, breathe: 8000 };
const MOOD: Record<DemoKind, Mood> = { list: 'curious', drag: 'hungry', timer: 'happy', sparkle: 'excited', tap: 'happy', shake: 'excited', breathe: 'calm' };
const PROP: Record<DemoKind, IconName> = { list: 'list', drag: 'foodSmall', timer: 'timer', sparkle: 'sparkle', tap: 'sparkle', shake: 'sparkles', breathe: 'heart' };

/**
 * The pet demoing one guide step (same idea as the drag-to-feed guide on Home). One shared value
 * loops 0 → 1 on the UI thread and each kind maps it to a small motion. Reduce Motion: a still
 * picture of the same scene. Colours come from theme tokens only, so it follows light / dark.
 */
export function GuideDemo({ kind, label }: { kind: DemoKind; label: string }) {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const p = useSharedValue(0);
  const w = useSharedValue(300);

  useEffect(() => {
    p.set(0);
    if (reduceMotion) return;
    p.set(withRepeat(withTiming(1, { duration: LOOP_MS[kind], easing: kind === 'breathe' ? Easing.inOut(Easing.sin) : Easing.linear }), -1, kind === 'breathe'));
    return () => cancelAnimation(p);
  }, [kind, p, reduceMotion]);

  const pet = useAnimatedStyle(() => {
    const t = p.get();
    if (kind === 'breathe') return { transform: [{ scale: interpolate(t, [0, 1], [0.86, 1.14], C) }] };
    if (kind === 'shake') return { transform: [{ rotate: `${interpolate(t, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1], [0, -8, 8, -6, 6, 0, 0], C)}deg` }] };
    if (kind === 'drag') return { transform: [{ scale: interpolate(t, [0.5, 0.62, 0.68, 0.76], [1, 1.08, 0.94, 1], C) }] };
    if (kind === 'tap' || kind === 'sparkle') return { transform: [{ translateY: interpolate(t, [0.3, 0.4, 0.5], [0, -8, 0], C) }] };
    return { transform: [{ translateY: interpolate(t, [0, 0.5, 1], [0, -3, 0], C) }] };
  });

  return (
    <View
      style={[styles.stage, { backgroundColor: colors.fill }]}
      onLayout={(e) => w.set(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}>
      <Animated.View style={[styles.pet, pet]}>
        <Pet size={84} still color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={MOOD[kind]} />
      </Animated.View>
      {reduceMotion ? <Still kind={kind} /> : <Moving kind={kind} p={p} w={w} />}
    </View>
  );
}

/** Reduce Motion: the same props, placed where the animation would end up. */
function Still({ kind }: { kind: DemoKind }) {
  const { colors } = useTheme();
  if (kind === 'breathe') return null;
  if (kind === 'list') return <Rows />;
  if (kind === 'timer') return <Ring progress={0.6} />;
  return (
    <View style={[styles.tile, styles.left, { backgroundColor: colors.card }]}>
      <Icon name={PROP[kind]} size={20} color={kind === 'sparkle' ? colors.primary : colors.ink} />
    </View>
  );
}

function Moving({ kind, p, w }: { kind: DemoKind; p: SharedValue<number>; w: SharedValue<number> }) {
  if (kind === 'list') return <Rows p={p} />;
  if (kind === 'timer') return <Ring p={p} />;
  if (kind === 'drag') return <Drag p={p} w={w} />;
  if (kind === 'sparkle') return <Sparkles p={p} />;
  if (kind === 'tap' || kind === 'shake') return <Tap p={p} icon={PROP[kind]} />;
  return null;
}

/** Three bites pop in one after the other. */
function Rows({ p }: { p?: SharedValue<number> }) {
  const { colors } = useTheme();
  return (
    <View style={styles.rows}>
      {[0, 1, 2].map((i) => (
        <Row key={i} i={i} p={p} color={colors.card} line={colors.fill2} />
      ))}
    </View>
  );
}

function Row({ i, p, color, line }: { i: number; p?: SharedValue<number>; color: string; line: string }) {
  const style = useAnimatedStyle(() => {
    if (!p) return { opacity: 1 };
    const t = p.get();
    const a = 0.1 + i * 0.18;
    return {
      opacity: interpolate(t, [a, a + 0.1, 0.9, 1], [0, 1, 1, 0], C),
      transform: [{ translateX: interpolate(t, [a, a + 0.12], [-12, 0], C) }],
    };
  });
  return (
    <Animated.View style={[styles.row, { backgroundColor: color }, style]}>
      <View style={[styles.rowDot, { backgroundColor: line }]} />
      <View style={[styles.rowLine, { backgroundColor: line, width: 48 - i * 10 }]} />
    </Animated.View>
  );
}

/** A progress ring stand-in: a bar that fills around the pet's timer. */
function Ring({ p, progress = 0 }: { p?: SharedValue<number>; progress?: number }) {
  const { colors } = useTheme();
  const fill = useAnimatedStyle(() => ({ width: `${(p ? interpolate(p.get(), [0, 0.9], [0, 1], C) : progress) * 100}%` }));
  return (
    <View style={[styles.left, styles.timer]}>
      <View style={[styles.tile, { backgroundColor: colors.card }]}>
        <Icon name="timer" size={20} color={colors.ink} />
      </View>
      <View style={[styles.track, { backgroundColor: colors.fill2 }]}>
        <Animated.View style={[styles.bar, { backgroundColor: colors.primary }, fill]} />
      </View>
    </View>
  );
}

/** Food arcs from the left into the pet's mouth (like the Home drag guide). */
function Drag({ p, w }: { p: SharedValue<number>; w: SharedValue<number> }) {
  const { colors } = useTheme();
  const food = useAnimatedStyle(() => {
    const t = p.get();
    const x0 = space.l;
    const x1 = Math.max(x0, w.get() / 2 - TILE / 2);
    return {
      opacity: interpolate(t, [0.6, 0.68, 0.9, 1], [1, 0, 0, 1], C),
      transform: [
        { translateX: interpolate(t, [0, 0.2, 0.6], [x0, x0, x1], C) },
        { translateY: H / 2 - TILE / 2 + interpolate(t, [0.2, 0.4, 0.6], [0, -34, 0], C) },
        { scale: interpolate(t, [0.1, 0.2, 0.55, 0.66], [1, 1.12, 1.1, 0.3], C) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.tile, styles.abs, { backgroundColor: colors.card, shadowColor: colors.shadow }, food]}>
      <Icon name="foodSmall" size={20} color={colors.ink} />
    </Animated.View>
  );
}

/** Sparkles float up from the pet. */
function Sparkles({ p }: { p: SharedValue<number> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[-46, 0, 46].map((dx, i) => (
        <Spark key={dx} dx={dx} i={i} p={p} />
      ))}
    </View>
  );
}

function Spark({ dx, i, p }: { dx: number; i: number; p: SharedValue<number> }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => {
    const t = (p.get() + i * 0.22) % 1;
    return { opacity: interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0], C), transform: [{ translateY: interpolate(t, [0, 1], [10, -40], C) }] };
  });
  return (
    <Animated.View style={[styles.spark, { marginStart: dx }, style]}>
      <Icon name="sparkle" size={16} color={colors.primary} />
    </Animated.View>
  );
}

/** A finger taps a tile beside the pet. */
function Tap({ p, icon }: { p: SharedValue<number>; icon: IconName }) {
  const { colors } = useTheme();
  const tile = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(p.get(), [0.25, 0.32, 0.42], [1, 0.86, 1], C) }] }));
  const hand = useAnimatedStyle(() => {
    const t = p.get();
    return {
      opacity: interpolate(t, [0, 0.12, 0.6, 0.75], [0, 1, 1, 0], C),
      transform: [{ translateY: interpolate(t, [0, 0.25, 0.32, 0.45], [26, 12, 8, 14], C) }, { translateX: 18 }],
    };
  });
  return (
    <View style={styles.left}>
      <Animated.View style={[styles.tile, { backgroundColor: colors.card }, tile]}>
        <Icon name={icon} size={20} color={colors.primary} />
      </Animated.View>
      <Animated.View style={[styles.abs, hand]} pointerEvents="none">
        <Icon name="hand" size={24} color={colors.ink} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { height: H, borderRadius: radius.card - space.m, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  pet: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute', start: 0, top: 0 },
  left: { position: 'absolute', start: space.l, top: H / 2 - TILE / 2 },
  tile: { width: TILE, height: TILE, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  rows: { position: 'absolute', start: space.l, top: space.l, gap: space.s },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s, height: 26, paddingHorizontal: space.s, borderRadius: 8 },
  rowDot: { width: 12, height: 12, borderRadius: 4 },
  rowLine: { height: 6, borderRadius: 3 },
  timer: { gap: space.s, width: 84 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3 },
  spark: { position: 'absolute', alignSelf: 'center', top: H / 2 - 30, start: '50%' },
});
