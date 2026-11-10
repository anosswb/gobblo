import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { GROUNDING } from '@/features/toolkit/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { duration, easing } from '@/theme/motion';
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

/** 5-4-3-2-1: one step at a time, a big number, Next. */
function Ground() {
  const look = useLook();
  const [step, setStep] = useState(0);
  const done = step >= GROUNDING.length;
  const g = GROUNDING[Math.min(step, GROUNDING.length - 1)];
  return (
    <>
      <Card style={styles.center}>
        <Pet size={110} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={done ? 'love' : 'calm'} />
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
    if (!reduceMotion) r.set(withRepeat(withSequence(withTiming(-1, { duration: 110, easing: easing.inOut }), withTiming(1, { duration: 110, easing: easing.inOut })), -1, true));
  };

  const wiggle = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.get() * 9}deg` }, { translateX: r.get() * 6 }] }));

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

/** Pet me: drag a finger over the pet. Every ~36 pt of stroking = a purr (haptic) and a heart. */
function PetMe() {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const [purrs, setPurrs] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [stroking, setStroking] = useState(false);
  const travelled = useSharedValue(0);
  const last = useSharedValue({ x: 0, y: 0 });

  const purr = (x: number) => {
    haptics.light();
    setPurrs((n) => n + 1);
    const id = Date.now() + Math.random();
    setHearts((h) => [...h.slice(-5), { id, x }]);
    setTimeout(() => setHearts((h) => h.filter((k) => k.id !== id)), 700);
  };

  const pan = usePanGesture({
    minDistance: 2,
    onActivate: (e) => {
      'worklet';
      last.set({ x: e.x, y: e.y });
      travelled.set(0);
      scheduleOnRN(setStroking, true);
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
      scheduleOnRN(setStroking, false);
    },
  });

  return (
    <>
      <Card style={styles.center}>
        <GestureDetector gesture={pan}>
          <View style={styles.petZone} accessible accessibilityRole="adjustable" accessibilityLabel={t.petLabel(petName)}
            accessibilityActions={[{ name: 'increment' }, { name: 'activate' }]}
            onAccessibilityAction={() => purr(110)}>
            <Pet size={170} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={stroking || purrs > 0 ? 'love' : 'curious'} />
            {hearts.map((h) => (
              <Animated.View key={h.id} entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInUp.duration(duration.fast)} exiting={FadeOut.duration(duration.quick)}
                style={[styles.heart, { start: Math.max(0, Math.min(200, h.x - 10)) }]}>
                <Icon name="heart" size={22} color={colors.pink} />
              </Animated.View>
            ))}
          </View>
        </GestureDetector>
        <Text variant="title2" style={styles.text}>{t.purrs(purrs)}</Text>
        <Text variant="subhead" tone="ink2" style={styles.text}>{t.petIntro(petName)}</Text>
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
  heart: { position: 'absolute', top: 16 },
});
