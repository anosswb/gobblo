import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useImperativeHandle, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/text';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

export type DrumItem = { key: string; emoji: string; text: string };
export type DrumHandle = { spin: (to: number) => void; snap: (to: number) => void };

const ROW = 52;
const VISIBLE = 5;
const LAPS = 6; // copies of the list, so a spin can travel several laps
/** a long, physical deceleration: fast start, ~2.6 s glide into place (no overshoot) */
const SPIN_MS = 2600;
const SPIN_EASE = Easing.bezier(0.1, 0.75, 0.15, 1);

/**
 * iOS picker drum: rows sit on a cylinder (rotateX + fade by distance from the centre band),
 * the selection band is a soft capsule. `spin(i)` glides several laps and lands on item i,
 * firing `onTick` once per row crossed (haptic + tick sound, getting slower as it slows).
 * Everything runs on the UI thread; React only hears about ticks and the landing.
 */
export function Drum({
  items,
  onTick,
  onLand,
  ref,
}: {
  items: DrumItem[];
  onTick: () => void;
  onLand: (index: number) => void;
  ref?: Ref<DrumHandle>;
}) {
  const { colors, reduceMotion } = useTheme();
  const n = Math.max(1, items.length);
  const offset = useSharedValue(n * 2 * ROW); // start a couple of laps in, so there is room both ways
  const jumping = useSharedValue(false);

  useEffect(() => {
    offset.set(n * 2 * ROW);
  }, [n, offset]);

  useImperativeHandle(ref, () => ({
    spin: (to: number) => {
      const cur = Math.round(offset.get() / ROW);
      const lap = n;
      // land on `to` at least 3 laps further on
      const base = cur - (cur % lap) + lap * 3;
      const target = (base + to) * ROW;
      // after landing, jump back to the same row in the middle lap (invisible, no tick)
      const settle = (done?: boolean) => {
        'worklet';
        if (!done) return;
        jumping.set(true);
        offset.set((n * 2 + to) * ROW);
        scheduleOnRN(onLand, to);
      };
      if (reduceMotion) {
        jumping.set(true);
        offset.set((n * 2 + to) * ROW);
        onLand(to);
        return;
      }
      offset.set(withTiming(target, { duration: SPIN_MS, easing: SPIN_EASE }, settle));
    },
    snap: (to: number) => offset.set((n * 2 + to) * ROW),
  }));

  // one tick per row crossed while spinning
  useAnimatedReaction(
    () => Math.round(offset.get() / ROW),
    (row, prev) => {
      if (jumping.get()) {
        jumping.set(false);
        return;
      }
      if (prev !== null && row !== prev) scheduleOnRN(onTick);
    },
  );

  const rows = Array.from({ length: n * LAPS }, (_, i) => ({ i, item: items[i % n] }));

  return (
    <View style={[styles.window, { height: ROW * VISIBLE }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.band, { top: ROW * 2, backgroundColor: colors.fill }]} />
      {items.length > 0 &&
        rows.map(({ i, item }) => <DrumRow key={`${item.key}-${i}`} index={i} item={item} offset={offset} />)}
      <LinearGradient pointerEvents="none" colors={[colors.card, `${colors.card}00`]} style={[styles.fade, styles.fadeTop]} />
      <LinearGradient pointerEvents="none" colors={[`${colors.card}00`, colors.card]} style={[styles.fade, styles.fadeBottom]} />
    </View>
  );
}

function DrumRow({ index, item, offset }: { index: number; item: DrumItem; offset: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const d = (index * ROW - offset.get()) / ROW; // rows from the centre band
    const a = Math.min(Math.abs(d), 3);
    return {
      opacity: a > 2.8 ? 0 : 1 - a * 0.28,
      transform: [
        { translateY: ROW * 2 + d * ROW * (1 - a * 0.06) },
        { perspective: 500 },
        { rotateX: `${-d * 22}deg` },
        { scale: 1 - a * 0.05 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.row, style]}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text variant="bodyBold" numberOfLines={1} style={styles.text}>
        {item.text}
      </Text>
    </Animated.View>
  );
}

export const DRUM_ROW = ROW;

const styles = StyleSheet.create({
  window: { overflow: 'hidden', alignSelf: 'stretch' },
  band: { position: 'absolute', start: space.s, end: space.s, height: ROW, borderRadius: radius.row + 2 },
  row: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    height: ROW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s,
    paddingHorizontal: space.xl,
  },
  emoji: { fontSize: 22, lineHeight: 28 },
  text: { flexShrink: 1, fontSize: 18 },
  fade: { position: 'absolute', start: 0, end: 0, height: ROW * 1.6 },
  fadeTop: { top: 0 },
  fadeBottom: { bottom: 0 },
});
