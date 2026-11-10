import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { rewardsFor } from '@/features/closet/items';
import { useLook } from '@/features/closet/use-look';
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
import type { FaceId, HatId } from './wardrobe';

const ev = en.evolve;
const STAGE_AT: Record<number, string> = Object.fromEntries(STAGES.map((st) => [st.level, st.name]));

/**
 * Evolution: the one big peak, and the only screen a new form shows (docs/15 item 3: it used to
 * be followed by a second level-up card). The old pet wobbles, a soft flash, the new form pops in
 * (0.92 → 1) already wearing what the level unlocked, with "Wear it" / "Later". A calm glow, no
 * turning rays. Reduce Motion: no wobble, a soft fade swap.
 */
export function Evolution({ stage, level, onDone }: { stage: number | null; level: number; onDone: () => void }) {
  return (
    <Modal visible={stage !== null} transparent animationType="fade" onRequestClose={onDone} statusBarTranslucent navigationBarTranslucent>
      {stage !== null ? <Scene stage={stage} level={level} onDone={onDone} /> : null}
    </Modal>
  );
}

function Scene({ stage, level, onDone }: { stage: number; level: number; onDone: () => void }) {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const patchPet = useAppStore((s) => s.patchPet);
  const wearable = rewardsFor(level, STAGE_AT).items.find((i) => i.slot === 'hat' || i.slot === 'face' || i.slot === 'color' || i.slot === 'room');
  const insets = useSafeAreaInsets();
  const pet = useAppStore((s) => s.pet);
  const [shown, setShown] = useState(Math.max(0, stage - 1));
  const [burst, setBurst] = useState(0);
  const evolved = shown === stage;

  const flash = useSharedValue(0);
  const wobble = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
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
  }, [stage, reduceMotion, flash, wobble, pop]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));
  // the new form arrives already wearing what the level unlocked
  const hat = (evolved && wearable?.slot === 'hat' ? wearable.id : look.hat) as HatId;
  const face = (evolved && wearable?.slot === 'face' ? wearable.id : look.face) as FaceId;
  const color = evolved && wearable?.slot === 'color' ? (wearable.id as typeof look.color) : pet.color;
  const wear = () => {
    if (wearable) patchPet({ [wearable.slot]: wearable.id } as Partial<typeof pet>);
    haptics.medium();
    play('pop');
    onDone();
  };
  const petStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wobble.get() * 6}deg` }, { scale: pop.get() }] }));

  return (
    <View style={styles.fill}>
      {/* follows the theme like the focus room (Anass 2026-11-08: the night scene made the black button vanish in light mode) */}
      <LinearGradient colors={[colors.roomTop, colors.roomMid, colors.roomBottom]} style={StyleSheet.absoluteFill} />
      <View style={styles.raysWrap} pointerEvents="none">
        <Svg width={520} height={520} viewBox="-260 -260 520 520">
          <Defs>
            <RadialGradient id="evoCore" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.35} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle r={240} fill="url(#evoCore)" />
        </Svg>
      </View>

      <View style={[styles.content, { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.top}>
          {evolved ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.titles}>
              <Text variant="caption" tone="roomInk2" style={styles.kicker}>{ev.kicker(pet.name, level)}</Text>
              <Text variant="title" tone="roomInk" style={styles.center}>{STAGES[stage].name}</Text>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.petWrap}>
          <Burst id={burst} size={320} />
          <Animated.View style={petStyle}>
            <Pet size={190} color={color} hat={hat} face={face} mood={evolved ? 'celebrating' : 'shocked'} stage={shown} />
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          {evolved ? (
            <Animated.View entering={FadeIn.delay(250).duration(300)} exiting={FadeOut.duration(150)} style={styles.bottomInner}>
              {wearable ? <Text variant="bodyBold" tone="roomInk" style={styles.center}>{ev.unlocked(wearable.name)}</Text> : null}
              {wearable ? (
                <PressScale accessibilityRole="button" onPress={wear} style={[styles.ok, { backgroundColor: colors.reward }]}>
                  <Text variant="bodyBold" tone="onReward">{ev.wear}</Text>
                </PressScale>
              ) : null}
              <PressScale accessibilityRole="button" onPress={onDone} style={[styles.ok, { backgroundColor: wearable ? colors.roomGlass : colors.reward }]}>
                <Text variant="bodyBold" tone={wearable ? 'roomInk' : 'onReward'}>{wearable ? ev.later : ev.ok}</Text>
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
  content: { flex: 1, paddingHorizontal: space.xl, justifyContent: 'space-between' },
  top: { minHeight: 120, alignItems: 'center' },
  titles: { alignItems: 'center', gap: space.xs },
  kicker: { textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600' },
  petWrap: { alignItems: 'center', justifyContent: 'center' },
  bottom: { minHeight: 160 },
  bottomInner: { gap: space.m },
  ok: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
