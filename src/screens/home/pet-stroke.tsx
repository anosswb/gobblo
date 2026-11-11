import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '@/lib/haptics';
import { FloatHeart } from '@/pet/hearts';
import { duration, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';

/**
 * Petting on Home (like Toolkit › Pet me): stroke the otter and it purrs. Every STROKE_PT of finger
 * travel = a light haptic, every HEART_EVERY purrs a small heart. On lift: a happy shiver and a
 * content face for CONTENT_MS, then it looks toward where the finger was with a hopeful face and
 * asks "Again?" once. Not petted within ASK_MS: back to its normal mood, no second ask.
 * Never a sad face here.
 *
 * Scroll vs stroke: the pan only starts after ACTIVE_X_PT of sideways travel; ACTIVE_X_PT is
 * smaller than FAIL_Y_PT, so a clearly vertical move (FAIL_Y_PT first) fails the stroke and the page
 * scrolls. A plain tap never moves enough, so the pet's tap (speech bubble) still works.
 */
export const STROKE_PT = 36;
export const HEART_EVERY = 3;
export const CONTENT_MS = 2500;
export const ASK_MS = 6000;
export const ACTIVE_X_PT = 8;
export const FAIL_Y_PT = 14;
/** how far it leans toward the finger when it asks */
const LOOK_PT = 5;
const LOOK_DEG = 5;
const SHIVER_DEG = 3;

export type PetPhase = 'idle' | 'stroke' | 'content' | 'asking';

type Timer = ReturnType<typeof setTimeout>;

export function usePetting({ reduceMotion, onAsk }: { reduceMotion: boolean; onAsk: () => void }) {
  const [phase, setPhase] = useState<PetPhase>('idle');
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  /** the petting stopped: the hearts on screen fade out now */
  const [heartsFading, setHeartsFading] = useState(false);
  const dropHeart = useCallback((id: number) => setHearts((h) => h.filter((k) => k.id !== id)), []);
  const purrs = useRef(0);
  const timers = useRef<Timer[]>([]);
  const askRef = useRef(onAsk);
  useEffect(() => {
    askRef.current = onAsk;
  });
  const shiver = useSharedValue(0);
  const look = useSharedValue(0);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  /** back to the normal mood (a feed, a tap, or nobody petted it again) */
  const reset = useCallback(() => {
    clear();
    setHeartsFading(true);
    setPhase('idle');
    look.set(withSpring(0, spring.apple));
  }, [look]);

  const start = () => {
    clear();
    purrs.current = 0;
    setHeartsFading(false);
    setPhase('stroke');
    look.set(withSpring(0, spring.apple));
  };

  const purr = (x: number) => {
    haptics.light();
    purrs.current += 1;
    if (purrs.current % HEART_EVERY !== 1) return;
    const id = Date.now() + Math.random();
    // each heart removes itself when its float ends (src/pet/hearts.tsx): no timer to lose
    setHearts((h) => [...h.slice(-3), { id, x }]);
  };

  const release = (x: number, width: number) => {
    clear();
    setHeartsFading(true);
    setPhase('content');
    if (!reduceMotion) {
      shiver.set(
        withSequence(
          withTiming(SHIVER_DEG, { duration: duration.micro }),
          withTiming(-SHIVER_DEG, { duration: duration.micro }),
          withTiming(SHIVER_DEG * 0.6, { duration: duration.micro }),
          withTiming(-SHIVER_DEG * 0.6, { duration: duration.micro }),
          withSpring(0, spring.squish),
        ),
      );
    }
    timers.current.push(
      setTimeout(() => {
        setPhase('asking');
        if (!reduceMotion) look.set(withSpring(x < width / 2 ? -1 : 1, spring.apple));
        askRef.current();
        timers.current.push(setTimeout(reset, ASK_MS));
      }, CONTENT_MS),
    );
  };

  const style = useAnimatedStyle(() => ({
    transformOrigin: 'center bottom',
    transform: [{ translateX: look.get() * LOOK_PT }, { rotate: `${shiver.get() + look.get() * LOOK_DEG}deg` }],
  }));

  return { phase, hearts, heartsFading, dropHeart, style, start, purr, release, reset };
}

/** The stroke area over the otter: a pan that feeds `usePetting`, plus the little hearts. */
export function PetStroke({
  petting,
  children,
}: PropsWithChildren<{ petting: Pick<ReturnType<typeof usePetting>, 'hearts' | 'heartsFading' | 'dropHeart' | 'start' | 'purr' | 'release'> }>) {
  const { colors, reduceMotion } = useTheme();
  const travelled = useSharedValue(0);
  const last = useSharedValue({ x: 0, y: 0 });
  const box = useSharedValue(0);
  const { start, purr, release } = petting;

  const pan = usePanGesture({
    activeOffsetX: [-ACTIVE_X_PT, ACTIVE_X_PT],
    failOffsetY: [-FAIL_Y_PT, FAIL_Y_PT],
    onActivate: (e) => {
      'worklet';
      last.set({ x: e.x, y: e.y });
      travelled.set(0);
      scheduleOnRN(start);
    },
    onUpdate: (e) => {
      'worklet';
      const l = last.get();
      const d = Math.hypot(e.x - l.x, e.y - l.y);
      last.set({ x: e.x, y: e.y });
      const total = travelled.get() + d;
      if (total >= STROKE_PT) {
        travelled.set(0);
        scheduleOnRN(purr, e.x);
      } else travelled.set(total);
    },
    onDeactivate: (e) => {
      'worklet';
      scheduleOnRN(release, e.x, box.get());
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <View onLayout={(e) => box.set(e.nativeEvent.layout.width)}>
        {children}
        {petting.hearts.map((h) => (
          <FloatHeart key={h.id} x={h.x - 10} color={colors.pink} fading={petting.heartsFading} reduceMotion={reduceMotion} onDone={() => petting.dropHeart(h.id)} />
        ))}
      </View>
    </GestureDetector>
  );
}

