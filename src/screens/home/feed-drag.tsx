import { createContext, useContext, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  measure,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { duration, spring } from '@/theme/motion';
import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/theme/theme-provider';

import { useBiteFocus } from './focus-context';
import { HOLD_MS, movedEnough } from './focus-logic';

/**
 * Drag-to-feed (docs/01 §1, the signature interaction): hold a bite, drag it onto
 * the pet. The pet opens its mouth while you carry food, chomps when you are over it, and a drop
 * opens the start sheet for that bite. A miss springs the food home. All on the UI thread; React
 * only hears start / over / drop / end.
 */
type Zone = { x: number; y: number; w: number; h: number };
type Ctx = {
  target: AnimatedRef<Animated.View>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  shown: SharedValue<number>;
  over: SharedValue<number>;
  onStart: (id: string, emoji: IconName) => void;
  onOver: (over: boolean) => void;
  onDrop: (id: string) => void;
  onEnd: () => void;
};

const FeedDragContext = createContext<Ctx | null>(null);
export const FeedDragProvider = ({ value, children }: PropsWithChildren<{ value: Ctx }>) => (
  <FeedDragContext.Provider value={value}>{children}</FeedDragContext.Provider>
);

export function useFeedDragState() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const shown = useSharedValue(0);
  const over = useSharedValue(0);
  return { x, y, shown, over };
}

const PAD = 28; // the pet's mouth zone is generous: thumbs are big

/** idle → holding (lifted, menu shown, finger down) → dragging (food follows the finger) */
const IDLE = 0;
const HOLDING = 1;
const DRAGGING = 2;

/**
 * The whole bite row is the handle (docs/16 point 6). One press, two results:
 * - hold still (HOLD_MS) → the bite lifts into focus mode with its menu (bite-focus.tsx);
 * - keep holding and move more than DRAG_SLOP → the menu goes and drag-to-feed takes over.
 * Moving before the hold fires fails the pan (RNGH: ~10 pt), so a scroll or a sideways swipe on
 * the list does nothing here and the ScrollView keeps scrolling (same pattern as the old food-only
 * handle: no simultaneous relations needed). `rowRef` is the row's box, measured on the UI thread.
 */
export function HoldBite({ id, emoji, rowRef, children }: PropsWithChildren<{ id: string; emoji: IconName; rowRef: AnimatedRef<Animated.View> }>) {
  const ctx = useContext(FeedDragContext);
  const focus = useBiteFocus();
  const zone = useSharedValue<Zone>({ x: 0, y: 0, w: 0, h: 0 });
  const home = useSharedValue({ x: 0, y: 0 });
  const phase = useSharedValue(IDLE);

  const pan = usePanGesture({
    activateAfterLongPress: HOLD_MS,
    enabled: !!ctx || !!focus,
    onActivate: (e) => {
      'worklet';
      home.set({ x: e.absoluteX, y: e.absoluteY });
      phase.set(HOLDING);
      if (!focus) return;
      const r = measure(rowRef);
      const c = measure(focus.container);
      if (r) scheduleOnRN(focus.onHold, id, { x: r.pageX - (c?.pageX ?? 0), y: r.pageY - (c?.pageY ?? 0), w: r.width, h: r.height });
    },
    onUpdate: (e) => {
      'worklet';
      if (!ctx) return;
      if (phase.get() === HOLDING) {
        const h = home.get();
        if (!movedEnough(e.absoluteX - h.x, e.absoluteY - h.y)) return;
        // still holding and moving: this is drag-to-feed
        phase.set(DRAGGING);
        const m = measure(ctx.target);
        if (m) zone.set({ x: m.pageX - PAD, y: m.pageY - PAD, w: m.width + PAD * 2, h: m.height + PAD * 2 });
        ctx.x.set(h.x);
        ctx.y.set(h.y);
        ctx.over.set(0);
        ctx.shown.set(withTiming(1, { duration: duration.micro }));
        if (focus) scheduleOnRN(focus.onDragStart);
        scheduleOnRN(ctx.onStart, id, emoji);
      }
      if (phase.get() !== DRAGGING) return;
      ctx.x.set(e.absoluteX);
      ctx.y.set(e.absoluteY);
      const z = zone.get();
      const inside = e.absoluteX > z.x && e.absoluteX < z.x + z.w && e.absoluteY > z.y && e.absoluteY < z.y + z.h ? 1 : 0;
      if (inside !== ctx.over.get()) {
        ctx.over.set(inside);
        scheduleOnRN(ctx.onOver, inside === 1);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      const was = phase.get();
      phase.set(IDLE);
      if (was === HOLDING) {
        if (focus) scheduleOnRN(focus.onHoldRelease, e.canceled);
        return;
      }
      if (was !== DRAGGING || !ctx) return;
      if (!e.canceled && ctx.over.get() === 1) {
        ctx.shown.set(withTiming(0, { duration: duration.quick }));
        scheduleOnRN(ctx.onDrop, id);
      } else {
        // a miss: the food flies back to its plate, carrying the release velocity feel
        const h = home.get();
        ctx.x.set(withSpring(h.x, spring.sheet));
        ctx.y.set(withSpring(h.y, spring.sheet));
        ctx.shown.set(withTiming(0, { duration: duration.fast }));
      }
      ctx.over.set(0);
      scheduleOnRN(ctx.onEnd);
      if (focus) scheduleOnRN(focus.onDragEnd);
    },
  });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}

/** The food that follows your finger, drawn above everything (Screen overlay). */
export function FloatingFood({ emoji, x, y, shown, over }: { emoji: IconName; x: SharedValue<number>; y: SharedValue<number>; shown: SharedValue<number>; over: SharedValue<number> }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [
      { translateX: x.get() - 30 },
      { translateY: y.get() - 70 }, // sits above the thumb so you can see it
      { scale: (0.8 + 0.4 * shown.get()) * (over.get() ? 0.85 : 1) },
      { rotate: `${over.get() ? -14 : 0}deg` },
    ],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.float, style]}>
      <View style={[styles.chip, { backgroundColor: colors.cardSolid, shadowColor: colors.shadow }]}>
        <Icon name={emoji} size={30} color={colors.ink} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // window coordinates, so `left` on purpose (not start/end): the finger's x is absolute
  float: { position: 'absolute', top: 0, left: 0, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  chip: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
});
