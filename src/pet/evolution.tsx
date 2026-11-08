import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { STAGES } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import { spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { Burst } from './burst';
import { Pet } from './pet';

const ev = en.evolve;
const RAYS = 14;

/**
 * Evolution (docs/01, docs/03 #6): the one big peak. Night sky, slow light rays (20 s turn),
 * the old pet wobbles, a white flash, the new stage pops in (0.92 → 1) with a sparkle burst,
 * heavy + success haptics. Reduce Motion: no rays turning, no wobble; a soft fade swap.
 */
export function Evolution({ stage, onDone }: { stage: number | null; onDone: () => void }) {
  return (
    <Modal visible={stage !== null} transparent animationType="fade" onRequestClose={onDone} statusBarTranslucent navigationBarTranslucent>
      {stage !== null ? <Scene stage={stage} onDone={onDone} /> : null}
    </Modal>
  );
}

function Scene({ stage, onDone }: { stage: number; onDone: () => void }) {
  const { colors, scheme, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const pet = useAppStore((s) => s.pet);
  const [shown, setShown] = useState(Math.max(0, stage - 1));
  const [burst, setBurst] = useState(0);
  const evolved = shown === stage;

  const turn = useSharedValue(0);
  const flash = useSharedValue(0);
  const wobble = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) turn.set(withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1));
    if (!reduceMotion) wobble.set(withSequence(...[1, -1, 1, -1, 0].map((v) => withTiming(v, { duration: 110 }))));
    haptics.medium();
    const t1 = setTimeout(() => {
      flash.set(withSequence(withTiming(1, { duration: 160 }), withDelay(60, withTiming(0, { duration: 420 }))));
    }, reduceMotion ? 200 : 700);
    const t2 = setTimeout(() => {
      setShown(stage);
      setBurst(1);
      if (!reduceMotion) pop.set(withSequence(withTiming(0.92, { duration: 0 }), withSpring(1, spring.squish)));
      haptics.heavy();
      setTimeout(() => haptics.success(), 120);
      play('spark');
    }, reduceMotion ? 300 : 860);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [stage, reduceMotion, turn, flash, wobble, pop]);

  const rays = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));
  const petStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wobble.get() * 6}deg` }, { scale: pop.get() }] }));

  return (
    <View style={styles.fill}>
      {/* follows the theme like the focus room (Anass 2026-11-08: the night scene made the black button vanish in light mode) */}
      <LinearGradient colors={[colors.roomTop, colors.roomMid, colors.roomBottom]} style={StyleSheet.absoluteFill} />
      <View style={styles.raysWrap} pointerEvents="none">
        <Animated.View style={[styles.rays, rays]}>
          <Svg width={720} height={720} viewBox="-360 -360 720 720">
            <Defs>
              <RadialGradient id="evoRay" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={scheme === 'dark' ? colors.roomInk : colors.primary} stopOpacity={scheme === 'dark' ? 0.26 : 0.16} />
                <Stop offset="1" stopColor={scheme === 'dark' ? colors.roomInk : colors.primary} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="evoCore" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.primary} stopOpacity={0.55} />
                <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <G>
              {Array.from({ length: RAYS }, (_, i) => (
                <Path key={i} d="M0 0 L-26 -360 L26 -360Z" fill="url(#evoRay)" transform={`rotate(${(360 / RAYS) * i})`} />
              ))}
            </G>
            <Circle r={190} fill="url(#evoCore)" />
          </Svg>
        </Animated.View>
      </View>

      <View style={[styles.content, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.top}>
          {evolved ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.titles}>
              <Text variant="caption" tone="roomInk2" style={styles.kicker}>{ev.kicker(pet.name)}</Text>
              <Text variant="title" tone="roomInk" style={styles.center}>{STAGES[stage].name}</Text>
              <Text variant="heading" style={[styles.center, { color: colors.reward }]}>{ev.cheer}</Text>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.petWrap}>
          <Burst id={burst} size={320} />
          <Animated.View style={petStyle}>
            <Pet size={190} color={pet.color} mood={evolved ? 'celebrating' : 'shocked'} stage={shown} />
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          {evolved ? (
            <Animated.View entering={FadeIn.delay(250).duration(300)} exiting={FadeOut.duration(150)} style={styles.bottomInner}>
              <Text variant="body" tone="roomInk2" style={styles.center}>{ev.line[stage % ev.line.length]}</Text>
              <PressScale accessibilityRole="button" onPress={onDone} style={[styles.ok, { backgroundColor: colors.reward }]}>
                <Text variant="bodyBold" tone="onReward">{ev.ok}</Text>
              </PressScale>
            </Animated.View>
          ) : null}
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.onFocus }, flashStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { textAlign: 'center' },
  raysWrap: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center' },
  rays: { width: 720, height: 720 },
  content: { flex: 1, paddingHorizontal: space.xl, justifyContent: 'space-between' },
  top: { minHeight: 120, alignItems: 'center' },
  titles: { alignItems: 'center', gap: space.xs },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600' },
  petWrap: { alignItems: 'center', justifyContent: 'center' },
  bottom: { minHeight: 130 },
  bottomInner: { gap: space.l },
  ok: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
