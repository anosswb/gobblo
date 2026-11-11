import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { duration, easing, spring } from '@/theme/motion';

import { addFeed, diving, FALL_MS, HOP_MS, type DivePlan, type FeedInfo } from './dive-logic';

/** How high the happy hop goes before the dive, and how far above rest it shoots out. */
export const HOP_PT = 30;
export const RISE_PT = 34;
/** How far the otter leans into the dive (degrees): nose first into the water. */
export const DIVE_TILT = 105;
/** Splash drops per splash (docs/18: 6–8). */
export const SPLASH_DROPS = 7;
/** Bubbles rising while it is under water. */
export const BUBBLES = 5;

type Timer = ReturnType<typeof setTimeout>;

/**
 * The happy dive choreography (docs/18 §5), as one smooth arc (Anass, phone test 11 Nov: "not a
 * cut"): the otter leaps up and out to one side, tips nose-first into the water there, swims
 * under the surface to the other side (bubbles follow it), leaps out there and lands back in its
 * place. The side alternates each time. `feed` is called once per feed; JS only sets a few timers
 * (hop, splash, surface), every movement runs on the UI thread. `depth` is how far down the pet
 * must go to be fully under the water line (the stage clips it); `reach` is how far to each side.
 * Reduce Motion: no leap, the pet fades out and back in.
 */
export function useHappyDive({
  depth,
  reach,
  reduceMotion,
  onDive,
  onSurface,
}: {
  depth: number;
  /** sideways distance of the entry and exit points from the otter's place */
  reach: number;
  reduceMotion: boolean;
  /** it hits the water: haptic + sound */
  onDive: () => void;
  /** it is back up: show the summed reward */
  onSurface: (plan: DivePlan) => void;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const tilt = useSharedValue(0);
  const fade = useSharedValue(1);
  const [splash, setSplash] = useState(0);
  /** where the last splash was (pt from the centre) */
  const [splashX, setSplashX] = useState(0);
  /** +1 = dives in on the right and comes out on the left; flips every dive */
  const side = useRef(1);
  const [under, setUnder] = useState(false);
  const plan = useRef<DivePlan | null>(null);
  const timers = useRef<{ hop?: Timer; dive?: Timer; up?: Timer }>({});
  const cb = useRef({ onDive, onSurface, depth, reach, reduceMotion });
  useEffect(() => {
    cb.current = { onDive, onSurface, depth, reach, reduceMotion };
  });
  useEffect(
    () => () => {
      const t = timers.current;
      clearTimeout(t.hop);
      clearTimeout(t.dive);
      clearTimeout(t.up);
    },
    [],
  );

  const surface = useCallback(() => {
    const p = plan.current;
    if (!p) return;
    setUnder(false);
    setSplash((n) => n + 1);
    if (cb.current.reduceMotion) {
      setSplashX(0);
      x.set(0);
      y.set(0);
      tilt.set(0);
      fade.set(withTiming(1, { duration: duration.quick }));
    } else {
      const out = -side.current * cb.current.reach;
      setSplashX(out);
      fade.set(1);
      // it leaps out on the far side, nose up, and arcs back to its place with one soft overshoot
      x.set(out);
      tilt.set(side.current * DIVE_TILT * 0.6);
      const leap = HOP_MS + FALL_MS;
      x.set(withTiming(0, { duration: leap, easing: Easing.out(Easing.quad) }));
      tilt.set(withTiming(0, { duration: leap, easing: easing.inOut }));
      y.set(withSequence(withTiming(-RISE_PT, { duration: HOP_MS, easing: easing.smoothOut }), withSpring(0, spring.sheet)));
      side.current = -side.current;
    }
    cb.current.onSurface(p);
  }, [x, y, tilt, fade]);

  const feed = useCallback((f: FeedInfo) => {
    const now = Date.now();
    const fresh = !diving(plan.current, now);
    const next = addFeed(plan.current, f, now);
    plan.current = next;
    const t = timers.current;
    if (fresh) {
      clearTimeout(t.hop);
      clearTimeout(t.dive);
      t.hop = setTimeout(() => {
        if (cb.current.reduceMotion) return;
        const d = cb.current.depth;
        const into = side.current * cb.current.reach;
        // one arc: up and out to the side, then nose-first down into the water
        // (it is at the entry point when it meets the water, which is when the swim takes over)
        x.set(withTiming(into, { duration: HOP_MS + FALL_MS / 2, easing: Easing.linear }));
        tilt.set(withTiming(side.current * DIVE_TILT, { duration: HOP_MS + FALL_MS, easing: easing.inOut }));
        y.set(
          withSequence(
            withTiming(-HOP_PT, { duration: HOP_MS, easing: easing.smoothOut }),
            withTiming(d, { duration: FALL_MS, easing: Easing.in(Easing.quad) }),
          ),
        );
      }, next.hopAt - now);
      t.dive = setTimeout(() => {
        if (cb.current.reduceMotion) fade.set(withTiming(0, { duration: duration.quick }));
        else {
          // under the surface it swims across to the other side; the bubbles follow it
          const swim = Math.max(duration.medium, (plan.current?.surfaceAt ?? Date.now()) - Date.now() - duration.micro);
          x.set(withTiming(-side.current * cb.current.reach, { duration: swim, easing: easing.inOut }));
        }
        setSplashX(cb.current.reduceMotion ? 0 : side.current * cb.current.reach);
        setSplash((n) => n + 1);
        setUnder(true);
        cb.current.onDive();
      }, next.diveAt - now);
    }
    clearTimeout(t.up);
    t.up = setTimeout(surface, next.surfaceAt - now);
  }, [x, y, tilt, fade, surface]);

  const style = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { rotate: `${tilt.get()}deg` }],
  }));
  /** follows the otter under the water (wrap the bubbles in it) */
  const trail = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  /** true from the feed until it surfaces (other celebrations wait) */
  const busy = useCallback(() => diving(plan.current, Date.now()), []);
  return { feed, busy, style, trail, splash, splashX, under };
}

/**
 * A splash at the water line: drops fly up and fall back, and one ring spreads on the surface.
 * Drawn in code, tinted from the water. Plays once per `id`. Reduce Motion: only the ring fades.
 */
export function Splash({ id, color, crest, reduceMotion }: { id: number; color: string; crest: string; reduceMotion: boolean }) {
  if (id === 0) return null;
  return (
    <View key={id} pointerEvents="none" style={styles.splash}>
      <Ring color={crest} reduceMotion={reduceMotion} />
      {reduceMotion ? null : Array.from({ length: SPLASH_DROPS }, (_, i) => <Drop key={i} index={i} color={i % 2 ? crest : color} />)}
    </View>
  );
}

function Ring({ color, reduceMotion }: { color: string; reduceMotion: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(1, { duration: duration.verySlow, easing: easing.strongOut }));
  }, [t]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return { opacity: 1 - p, transform: [{ scaleX: reduceMotion ? 1 : 0.6 + 1.4 * p }, { scaleY: reduceMotion ? 1 : 0.6 + 0.9 * p }] };
  });
  return <Animated.View style={[styles.ring, { borderColor: color }, style]} />;
}

function Drop({ index, color }: { index: number; color: string }) {
  const t = useSharedValue(0);
  // spread across a fan: outer drops go wider and lower, middle ones higher
  const side = (index / (SPLASH_DROPS - 1)) * 2 - 1;
  const dx = side * 34;
  const up = 34 - Math.abs(side) * 14 + (index % 2) * 6;
  const r = 3 + (index % 3);
  useEffect(() => {
    t.set(withDelay((index % 3) * 20, withTiming(1, { duration: duration.verySlow + duration.quick, easing: easing.inOut })));
  }, [index, t]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    // a throw: up and out, then gravity brings it back to the line
    return {
      opacity: p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25,
      transform: [{ translateX: dx * p }, { translateY: -up * 4 * p * (1 - p) }, { scale: 1 - 0.3 * p }],
    };
  });
  return <Animated.View style={[styles.drop, { width: r * 2, height: r * 2.4, borderRadius: r, backgroundColor: color }, style]} />;
}

/**
 * Small bubbles rising to the water line while the pet is under, so the box never looks empty.
 * Reduce Motion: they only fade in and out where they are.
 */
export function Bubbles({ color, crest, reduceMotion }: { color: string; crest: string; reduceMotion: boolean }) {
  return (
    <Animated.View pointerEvents="none" exiting={FadeOut.duration(duration.quick)} style={styles.bubbles}>
      {Array.from({ length: BUBBLES }, (_, i) => (
        <Bubble key={i} index={i} color={color} crest={crest} reduceMotion={reduceMotion} />
      ))}
    </Animated.View>
  );
}

function Bubble({ index, color, crest, reduceMotion }: { index: number; color: string; crest: string; reduceMotion: boolean }) {
  const t = useSharedValue(0);
  const x = ((index * 37) % 70) - 35;
  const r = 3 + ((index * 5) % 4);
  useEffect(() => {
    t.set(withDelay(index * duration.quick, withRepeat(withTiming(1, { duration: duration.verySlow * 2, easing: easing.inOut }), -1)));
  }, [index, t]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1,
      transform: reduceMotion ? [] : [{ translateY: 18 - 34 * p }, { translateX: Math.sin(p * 6.28 + index) * 3 }],
    };
  });
  return <Animated.View style={[styles.bubble, { start: x, width: r * 2, height: r * 2, borderRadius: r, borderColor: crest, backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  // centred on the water line: the parent places this 0-height row at the line
  splash: { position: 'absolute', start: 0, end: 0, top: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 84, height: 16, borderRadius: 42, borderWidth: 2 },
  drop: { position: 'absolute' },
  bubbles: { position: 'absolute', start: '50%', top: 0, width: 0, height: 0 },
  bubble: { position: 'absolute', borderWidth: 1.5 },
});
