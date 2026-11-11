import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  cancelAnimation,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { GROUNDING } from '@/features/toolkit/logic';
import { nextPetPhase, PET_MOOD, phaseTimeout, type PetEvent, type PetPhase } from '@/features/toolkit/pet-me';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { FloatHeart } from '@/pet/hearts';
import { Pet, type Mood, type PetAct } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { duration, easing, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

import { BreatheBody } from './breathe';
import { Button, Card, toolStyles } from './parts';

const t = en.tools.calm;
type Mode = 'breathe' | 'ground' | 'shake' | 'pet';

/** Calm: four short ways to come back to your body. */
export function CalmTool() {
  const [mode, setMode] = useState<Mode>('breathe');
  return (
    <Screen back title={en.tools.tiles.calm.title}>
      <Text variant="subhead" tone="ink2" style={toolStyles.intro}>{t.intro}</Text>
      <Segmented
        accessibilityLabel={t.mode}
        value={mode}
        onChange={(m) => { setMode(m); haptics.select(); }}
        options={[{ value: 'breathe', label: t.breathe }, { value: 'ground', label: t.ground }, { value: 'shake', label: t.shakeShort }, { value: 'pet', label: t.pet }]}
      />
      {mode === 'breathe' ? <BreatheBody /> : mode === 'ground' ? <Ground /> : mode === 'shake' ? <Shake /> : <PetMe />}
    </Screen>
  );
}

/** What the otter does on each grounding step: it shows the sense you are using (the last step is a slow breath). */
const GROUND_ACT: { act?: PetAct; mood: Mood }[] = [
  { act: 'see', mood: 'hopeful' }, // eyes open wide
  { act: 'touch', mood: 'happy' }, // paws pat the pebble
  { act: 'hear', mood: 'happy' }, // ears perk up
  { act: 'smell', mood: 'happy' }, // the nose sniffs
  { mood: 'calm' },
];

/** 5-4-3-2-1: one step at a time, a big number, Next. The otter acts out each sense. */
function Ground() {
  const look = useLook();
  const [step, setStep] = useState(0);
  const done = step >= GROUNDING.length;
  const g = GROUNDING[Math.min(step, GROUNDING.length - 1)];
  return (
    <>
      <Card style={styles.center}>
        <Pet size={130} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={done ? 'love' : GROUND_ACT[step]?.mood ?? 'calm'} act={done ? undefined : GROUND_ACT[step]?.act} />
        <Animated.View key={step} entering={FadeIn.duration(duration.fast)} style={styles.center} accessibilityLiveRegion="polite">
          {done ? (
            <Text variant="title2" style={styles.text}>{t.groundDone}</Text>
          ) : (
            <>
              <Text variant="timer" tone="primary">{g.n}</Text>
              <Text variant="title2" style={styles.text}>{g.text}</Text>
            </>
          )}
        </Animated.View>
        {!done && step === 0 ? <Text variant="subhead" tone="ink2" style={styles.text}>{t.groundIntro}</Text> : null}
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {GROUNDING.map((x, i) => <Dot key={x.n} on={i < step} />)}
        </View>
      </Card>
      {done ? (
        <Button label={t.again} soft icon="repeat" onPress={() => { setStep(0); haptics.select(); }} />
      ) : (
        <Button label={t.next} onPress={() => {
          const next = step + 1;
          setStep(next);
          if (next >= GROUNDING.length) { haptics.success(); play('chime'); } else haptics.select();
        }} />
      )}
    </>
  );
}

function Dot({ on }: { on: boolean }) {
  const { colors } = useTheme();
  return <View style={[styles.dot, { backgroundColor: on ? colors.primary : colors.fill2 }]} />;
}

const SHAKE_S = 20;

/** Shake it out: 20 seconds of wiggling with the pet. Reduce Motion: the pet stays still. */
function Shake() {
  const { reduceMotion } = useTheme();
  const look = useLook();
  const [left, setLeft] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const r = useSharedValue(0);

  useEffect(() => {
    if (left === null) return;
    const id = setTimeout(() => {
      if (left > 1) {
        if (left % 5 === 1) haptics.light();
        setLeft(left - 1);
        return;
      }
      cancelAnimation(r);
      r.set(withTiming(0, { duration: duration.quick }));
      haptics.success();
      play('spark');
      setDone(true);
      setLeft(null);
    }, 1000);
    return () => clearTimeout(id);
  }, [left, r]);

  useEffect(() => () => cancelAnimation(r), [r]);

  const go = () => {
    setDone(false);
    setLeft(SHAKE_S);
    haptics.medium();
    // the otter shakes with you (Anass's phone test, 11 Nov: it stood still). It always moves,
    // even when the phone has animations off: calm = a slow, small sway instead of the fast shake.
    const ms = reduceMotion ? 260 : 110;
    const opt = { duration: ms, easing: easing.inOut, reduceMotion: ReduceMotion.Never };
    r.set(withRepeat(withSequence(withTiming(-1, opt), withTiming(1, opt)), -1, true, undefined, ReduceMotion.Never));
  };

  const wiggle = useAnimatedStyle(() => {
    const k = reduceMotion ? 0.4 : 1;
    return { transform: [{ rotate: `${r.get() * 9 * k}deg` }, { translateX: r.get() * 6 * k }] };
  });

  return (
    <>
      <Card style={styles.center}>
        <Animated.View style={wiggle}>
          <Pet size={130} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={left !== null ? 'excited' : done ? 'proud' : 'happy'} still={left !== null} />
        </Animated.View>
        <View style={styles.center} accessibilityLiveRegion="polite">
          {left !== null ? (
            <Text variant="timer" tone="primary">{t.shakeLeft(left)}</Text>
          ) : (
            <Text variant="title2" style={styles.text}>{done ? t.shakeDone : t.shake}</Text>
          )}
          {left === null && !done ? <Text variant="subhead" tone="ink2" style={styles.text}>{t.shakeIntro}</Text> : null}
        </View>
      </Card>
      {left === null ? <Button label={done ? t.again : t.shakeGo} icon={done ? 'repeat' : 'play'} soft={done} onPress={go} /> : null}
    </>
  );
}

const STROKE_PX = 36;
const LEAN_PX = 10;

/**
 * Pet me: drag a finger over the pet. Every ~36 pt of stroking = a purr (haptic) and a heart.
 * Lifting the finger: a happy shiver and a thank-you, then a hopeful "again?", then it settles.
 */
function PetMe() {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const [purrs, setPurrs] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [phase, setPhase] = useState<PetPhase>('idle');
  const [line, setLine] = useState<string>(t.petIntro(petName));
  const lineCount = useRef(0);
  const travelled = useSharedValue(0);
  const last = useSharedValue({ x: 0, y: 0 });
  const rot = useSharedValue(0);
  const lean = useSharedValue(0);
  const lastX = useRef(110);
  /** the petting stopped: the hearts on screen fade out now */
  const [heartsFading, setHeartsFading] = useState(false);

  const dispatch = (event: PetEvent) => setPhase((p) => nextPetPhase(p, event));

  const purr = (x: number) => {
    haptics.light();
    setHeartsFading(false);
    lastX.current = x;
    setPurrs((n) => n + 1);
    const id = Date.now() + Math.random();
    // each heart removes itself when its float ends (src/pet/hearts.tsx)
    setHearts((h) => [...h.slice(-5), { id, x }]);
  };
  const startPetting = () => {
    setHeartsFading(false);
    dispatch('pet');
  };
  const lift = () => {
    setHeartsFading(true);
    dispatch('lift');
  };
  /** Screen-reader action: the same flow as a stroke (purr, then thanks, then asking). */
  const a11yPurr = () => {
    purr(110);
    dispatch('pet');
    dispatch('lift');
  };

  // Timed steps. The timer is cleared whenever the phase changes or the screen goes away.
  useEffect(() => {
    const ms = phaseTimeout(phase);
    if (ms === null) return;
    const id = setTimeout(() => dispatch('timeout'), ms);
    return () => clearTimeout(id);
  }, [phase]);

  // One line per phase, picked once when the phase starts (so screen readers hear it once).
  useEffect(() => {
    if (phase === 'thanks' || phase === 'asking') {
      const list = phase === 'thanks' ? t.thanks : t.asking;
      setLine(list[lineCount.current++ % list.length]);
    } else if (phase === 'settled') setLine(t.settled);
    else if (phase === 'idle') setLine(t.petIntro(petName));

    cancelAnimation(rot);
    if (phase === 'thanks' && !reduceMotion) {
      // happy shiver: ±3°, 3 cycles, ~450 ms
      rot.set(withSequence(
        withTiming(3, { duration: 38 }),
        withRepeat(withTiming(-3, { duration: 75, easing: easing.inOut }), 5, true),
        withTiming(0, { duration: 37 }),
      ));
    } else rot.set(withTiming(0, { duration: duration.quick }));

    const toward = lastX.current < 110 ? -1 : 1;
    lean.set(phase === 'asking' && !reduceMotion ? withSpring(toward * LEAN_PX, spring.apple) : withSpring(0, spring.apple));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduceMotion]);

  const petStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lean.get() }, { rotate: `${rot.get() + lean.get() * 0.3}deg` }],
  }));

  const pan = usePanGesture({
    minDistance: 2,
    onActivate: (e) => {
      'worklet';
      last.set({ x: e.x, y: e.y });
      travelled.set(0);
      scheduleOnRN(startPetting);
    },
    onUpdate: (e) => {
      'worklet';
      const l = last.get();
      const d = Math.hypot(e.x - l.x, e.y - l.y);
      last.set({ x: e.x, y: e.y });
      const total = travelled.get() + d;
      if (total >= STROKE_PX) {
        travelled.set(0);
        scheduleOnRN(purr, e.x);
      } else travelled.set(total);
    },
    onDeactivate: () => {
      'worklet';
      scheduleOnRN(lift);
    },
  });

  return (
    <>
      <Card style={styles.center}>
        <GestureDetector gesture={pan}>
          <View style={styles.petZone} accessible accessibilityRole="adjustable" accessibilityLabel={t.petLabel(petName)}
            accessibilityActions={[{ name: 'increment' }, { name: 'activate' }]}
            onAccessibilityAction={a11yPurr}>
            <Animated.View style={petStyle}>
              <Pet size={170} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={PET_MOOD[phase]} />
            </Animated.View>
            {hearts.map((h) => (
              <FloatHeart key={h.id} x={Math.max(0, Math.min(200, h.x - 10))} top={16} size={22} color={colors.pink} fading={heartsFading} reduceMotion={reduceMotion}
                onDone={() => setHearts((list) => list.filter((k) => k.id !== h.id))} />
            ))}
          </View>
        </GestureDetector>
        <Text variant="title2" style={styles.text}>{t.purrs(purrs)}</Text>
        <Text variant="subhead" tone="ink2" style={styles.text} accessibilityLiveRegion="polite">{line}</Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: space.s },
  text: { textAlign: 'center' },
  dots: { flexDirection: 'row', gap: space.s, marginTop: space.s },
  dot: { width: 8, height: 8, borderRadius: 4 },
  petZone: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
});
