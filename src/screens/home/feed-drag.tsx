import { createContext, useContext, type PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
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

import { Text } from '@/components/text';
import { spring } from '@/theme/motion';

/**
 * Drag-to-feed (docs/01 §1, the signature interaction): long-press a bite's food, drag it onto
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
  onStart: (id: string, emoji: string) => void;
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

/** Wrap a food tile; long-press (220 ms) turns it into a draggable bite. */
export function DraggableFood({ id, emoji, children }: PropsWithChildren<{ id: string; emoji: string }>) {
  const ctx = useContext(FeedDragContext);
  const zone = useSharedValue<Zone>({ x: 0, y: 0, w: 0, h: 0 });
  const home = useSharedValue({ x: 0, y: 0 });

  const pan = usePanGesture({
    activateAfterLongPress: 220,
    enabled: !!ctx,
    onActivate: (e) => {
      'worklet';
      if (!ctx) return;
      const m = measure(ctx.target);
      if (m) zone.set({ x: m.pageX - PAD, y: m.pageY - PAD, w: m.width + PAD * 2, h: m.height + PAD * 2 });
      home.set({ x: e.absoluteX, y: e.absoluteY });
      ctx.x.set(e.absoluteX);
      ctx.y.set(e.absoluteY);
      ctx.over.set(0);
      ctx.shown.set(withTiming(1, { duration: 120 }));
      scheduleOnRN(ctx.onStart, id, emoji);
    },
    onUpdate: (e) => {
      'worklet';
      if (!ctx) return;
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
      if (!ctx) return;
      if (!e.canceled && ctx.over.get() === 1) {
        ctx.shown.set(withTiming(0, { duration: 160 }));
        scheduleOnRN(ctx.onDrop, id);
      } else {
        // a miss: the food flies back to its plate, carrying the release velocity feel
        const h = home.get();
        ctx.x.set(withSpring(h.x, spring.sheet));
        ctx.y.set(withSpring(h.y, spring.sheet));
        ctx.shown.set(withTiming(0, { duration: 260 }));
      }
      ctx.over.set(0);
      scheduleOnRN(ctx.onEnd);
    },
  });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}

/** The food that follows your finger, drawn above everything (Screen overlay). */
export function FloatingFood({ emoji, x, y, shown, over }: { emoji: string; x: SharedValue<number>; y: SharedValue<number>; shown: SharedValue<number>; over: SharedValue<number> }) {
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
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // window coordinates, so `left` on purpose (not start/end): the finger's x is absolute
  float: { position: 'absolute', top: 0, left: 0, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 46, lineHeight: 56 },
});
