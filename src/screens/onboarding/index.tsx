import { ArrowLeft, DiceFive } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { FOOD } from '@/features/bites/logic';
import { guessSize } from '@/features/dump/parse';
import { askNotificationPermission } from '@/features/nudges/schedule';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { Egg } from '@/pet/egg';
import { PetStandin } from '@/pet/pet-standin';
import { useAppStore } from '@/state/app-store';
import { distance, duration, easing, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, petColors, radius, space, typeScale, type PetColor } from '@/theme/tokens';

import { FeelStep } from './feel-step';

const o = en.onboarding;
const STEPS = ['hook', 'quiz', 'feel', 'hatch', 'name', 'nudge'] as const;
type Step = (typeof STEPS)[number];
type Hatch = 'egg' | 'cracking' | 'hatched';

/** transitions.dev page slide: 8 px, 250 ms, smooth-out. */
const pageIn = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateX: distance.base * 3 }] },
    animations: {
      opacity: withTiming(1, { duration: duration.fast, easing: easing.smoothOut }),
      transform: [{ translateX: withTiming(0, { duration: duration.fast, easing: easing.smoothOut }) }],
    },
  };
};
/** Pet pops out of the egg: from 0.6, never from 0. */
const hatchIn = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.6 }, { translateY: distance.medium }] },
    animations: {
      opacity: withTiming(1, { duration: duration.quick }),
      transform: [{ scale: withSpring(1, spring.pop) }, { translateY: withSpring(0, spring.pop) }],
    },
  };
};

/**
 * First launch (Phase 3 plan, DECISIONS: hatch by feeding, name after hatching, sound & feel
 * shown up front). ~60 seconds, skippable, no paywall, no ads (CLAUDE.md hard rules).
 * hook → "what wrecks your day?" → make it yours → feed the egg → name → gentle nudge ask.
 */
export function OnboardingScreen() {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const pet = useAppStore((s) => s.pet);
  const updatePet = useAppStore((s) => s.updatePet);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const addBites = useAppStore((s) => s.addBites);

  const [step, setStep] = useState<Step>('hook');
  const [pick, setPick] = useState<string | null>(null);
  const [thought, setThought] = useState('');
  const [hatch, setHatch] = useState<Hatch>('egg');
  const [cracks, setCracks] = useState(0);
  const [fed, setFed] = useState('');
  const [name, setName] = useState(pet.name);
  const [color, setColor] = useState<PetColor>(pet.color);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idx = STEPS.indexOf(step);

  const progress = useSharedValue(0);
  useEffect(() => {
    const to = (idx + 1) / STEPS.length;
    progress.set(reduceMotion ? to : withSpring(to, spring.fill));
  }, [idx, reduceMotion, progress]);
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const go = (next: Step) => {
    haptics.light();
    setStep(next);
  };
  const back = () => {
    if (idx > 0 && hatch !== 'cracking') setStep(STEPS[idx - 1]);
  };

  // Android back = previous step (not out of the app)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (idx === 0) return false;
      back();
      return true;
    });
    return () => sub.remove();
  });

  const finish = (nudge: 'gentle' | 'off') => {
    updatePet({ name: name.trim() || pet.name, color });
    updateSettings({ onboarded: true, nudge });
    haptics.success();
    play('spark');
    // the root Stack.Protected guard moves us to Home once `onboarded` is true
    setTimeout(() => toast(o.done(name.trim() || pet.name)), duration.slow);
  };

  const skip = () => {
    updateSettings({ onboarded: true });
    haptics.light();
  };

  const feedEgg = () => {
    const text = thought.trim();
    if (!text) {
      haptics.warning();
      play('nope');
      toast(o.hatchEmpty);
      return;
    }
    const nice = text.charAt(0).toUpperCase() + text.slice(1);
    addBites([{ text: nice, size: guessSize(nice) }]);
    setFed(nice);
    setHatch('cracking');
    haptics.medium();
    play('pop');
    const beat = reduceMotion ? 250 : 420;
    [1, 2, 3].forEach((n) => {
      timers.current.push(
        setTimeout(() => {
          setCracks(n);
          haptics.light();
          play('tick');
        }, beat * n),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setHatch('hatched');
        haptics.success();
        play('spark');
      }, beat * 4 + 120),
    );
  };

  const rollName = () => {
    const pool = o.names.filter((n) => n !== name);
    setName(pool[Math.floor(Math.random() * pool.length)]);
    haptics.select();
    play('tick');
  };

  const nudgeYes = async () => {
    const ok = await askNotificationPermission().catch(() => false);
    if (!ok) toast(o.nudgeDenied);
    finish(ok ? 'gentle' : 'off');
  };

  const enter = reduceMotion ? FadeIn.duration(duration.quick) : pageIn;
  const reply = o.quiz.find((q) => q.id === pick)?.reply;

  // ---------- bottom button per step (look) ----------
  const ctaLabel =
    step === 'hook' ? o.hookCta
    : step === 'hatch' ? (hatch === 'hatched' ? o.next : o.hatchCta)
    : step === 'name' ? o.nameCta(name.trim() || pet.name)
    : step === 'nudge' ? o.nudgeYes
    : o.next;
  const ctaReward = step === 'hatch' || step === 'nudge';
  const ctaDisabled = (step === 'quiz' && !pick) || (step === 'hatch' && hatch === 'cracking');

  // ---------- bottom button per step (action) ----------
  const onCta = () => {
    switch (step) {
      case 'hook':
        play('pop');
        return go('quiz');
      case 'quiz':
        return go('feel');
      case 'feel':
        return go('hatch');
      case 'hatch':
        return hatch === 'hatched' ? go('name') : feedEgg();
      case 'name':
        play('pop');
        return go('nudge');
      case 'nudge':
        return void nudgeYes();
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.top, { paddingTop: insets.top + space.s }]}>
        <View style={styles.topRow}>
          {idx > 0 ? (
            <PressScale accessibilityRole="button" accessibilityLabel={o.back} hitSlop={10} onPress={back}
              style={[styles.round, { backgroundColor: colors.card, borderColor: colors.line, opacity: hatch === 'cracking' ? 0.4 : 1 }]}>
              <ArrowLeft size={20} weight="bold" color={colors.ink} />
            </PressScale>
          ) : (
            <View style={styles.round} />
          )}
          <View style={[styles.track, { backgroundColor: colors.cardAlt }]} accessibilityRole="progressbar" accessibilityLabel={o.step(idx + 1, STEPS.length)}>
            <Animated.View style={[styles.trackFill, { backgroundColor: colors.primary }, barStyle]} />
          </View>
          {step === 'hook' ? (
            <PressScale accessibilityRole="button" hitSlop={10} onPress={skip} style={styles.skip}>
              <Text variant="bodyBold" tone="ink2">{o.skip}</Text>
            </PressScale>
          ) : (
            <View style={styles.round} />
          )}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: space.xxxl * 3 }]}>
        <Animated.View key={step} entering={enter} style={styles.page}>
          {step === 'hook' && (
            <View style={styles.hero}>
              <Egg size={170} />
              <Text variant="title" style={styles.center}>{o.hookTitle}</Text>
              <Text tone="ink2" style={styles.center}>{o.hookSub}</Text>
              <Text variant="caption" tone="ink3" style={styles.center}>{o.hookNote}</Text>
            </View>
          )}

          {step === 'quiz' && (
            <>
              <View style={styles.head}>
                <Text variant="title">{o.quizTitle}</Text>
                <Text tone="ink2">{o.quizSub}</Text>
              </View>
              <View style={styles.list}>
                {o.quiz.map((q) => {
                  const on = pick === q.id;
                  return (
                    <PressScale key={q.id} accessibilityRole="radio" accessibilityState={{ selected: on }}
                      onPress={() => { setPick(q.id); haptics.select(); play('pop'); }}
                      style={[styles.option, { backgroundColor: on ? colors.primary : colors.card, borderColor: on ? colors.primaryDeep : colors.line }]}>
                      <Text style={styles.optEmoji}>{q.emoji}</Text>
                      <Text variant="bodyBold" tone={on ? 'onPrimary' : 'ink'} style={styles.flex}>{q.label}</Text>
                    </PressScale>
                  );
                })}
              </View>
              {reply ? (
                <View style={styles.replyRow}>
                  <Egg size={64} />
                  <Animated.View key={pick} entering={enter} style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    <Text variant="bodyBold">{reply}</Text>
                  </Animated.View>
                </View>
              ) : null}
            </>
          )}

          {step === 'feel' && (
            <>
              <View style={styles.head}>
                <Text variant="title">{o.feelTitle}</Text>
                <Text tone="ink2">{o.feelSub}</Text>
              </View>
              <FeelStep />
            </>
          )}

          {step === 'hatch' && (
            <>
              <View style={styles.hero}>
                {hatch === 'hatched' ? (
                  <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : hatchIn}>
                    <PetStandin size={150} color={color} />
                  </Animated.View>
                ) : (
                  <Egg size={160} cracks={cracks} />
                )}
                <Text variant="title" style={styles.center}>
                  {hatch === 'hatched' ? o.hatched : hatch === 'cracking' ? o.hatching : o.hatchTitle}
                </Text>
                <Text tone="ink2" style={styles.center}>{hatch === 'hatched' ? o.hatchedSub(fed) : o.hatchSub}</Text>
              </View>
              {hatch === 'egg' ? (
                <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.line }]}>
                  <Text style={styles.optEmoji}>{FOOD[guessSize(thought || 'x')].emoji}</Text>
                  <TextInput value={thought} onChangeText={setThought} placeholder={o.hatchPlaceholder} placeholderTextColor={colors.ink3}
                    accessibilityLabel={o.hatchLabel} maxLength={120} returnKeyType="done" onSubmitEditing={feedEgg}
                    style={[styles.input, { color: colors.ink, fontFamily: fonts.bodyBold }]} />
                </View>
              ) : null}
            </>
          )}

          {step === 'name' && (
            <>
              <View style={styles.hero}>
                <PetStandin size={130} color={color} />
                <Text variant="title" style={styles.center}>{o.nameTitle}</Text>
                <Text tone="ink2" style={styles.center}>{o.nameSub}</Text>
              </View>
              <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.line }]}>
                <TextInput value={name} onChangeText={setName} accessibilityLabel={o.nameLabel} maxLength={16} returnKeyType="done"
                  autoCapitalize="words" style={[styles.input, styles.nameInput, { color: colors.ink, fontFamily: fonts.display }]} />
                <PressScale accessibilityRole="button" accessibilityLabel={o.dice} onPress={rollName}
                  style={[styles.dice, { backgroundColor: colors.cardAlt }]}>
                  <DiceFive size={24} weight="fill" color={colors.primary} />
                </PressScale>
              </View>
              <View style={styles.swatches} accessibilityRole="radiogroup" accessibilityLabel={o.colour}>
                {(Object.keys(petColors) as PetColor[]).map((c) => (
                  <PressScale key={c} accessibilityRole="radio" accessibilityLabel={o.colours[c]} accessibilityState={{ selected: color === c }}
                    onPress={() => { setColor(c); haptics.select(); play('pop'); }}
                    style={[styles.swatchRing, { borderColor: color === c ? colors.ink : 'transparent' }]}>
                    <View style={[styles.swatch, { backgroundColor: petColors[c] }]} />
                  </PressScale>
                ))}
              </View>
            </>
          )}

          {step === 'nudge' && (
            <View style={styles.hero}>
              <PetStandin size={130} color={color} />
              <Text variant="title" style={styles.center}>{o.nudgeTitle}</Text>
              <Text tone="ink2" style={styles.center}>{o.nudgeSub(name.trim() || pet.name)}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + space.m, backgroundColor: colors.bg }]}>
        <PressScale accessibilityRole="button" disabled={ctaDisabled} onPress={onCta}
          style={[styles.btn, ctaReward
            ? { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep }
            : { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep }, ctaDisabled && styles.disabled]}>
          <Text variant="bodyBold" tone={ctaReward ? 'onReward' : 'onPrimary'}>{ctaLabel}</Text>
        </PressScale>
        {step === 'nudge' ? (
          <PressScale accessibilityRole="button" onPress={() => finish('off')} style={styles.link}>
            <Text variant="bodyBold" tone="ink2">{o.nudgeNo}</Text>
          </PressScale>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  top: { paddingHorizontal: space.gutter },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 48 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  skip: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 5 },
  content: { paddingHorizontal: space.gutter, paddingTop: space.xl },
  page: { gap: space.l },
  hero: { alignItems: 'center', gap: space.m, paddingTop: space.l },
  head: { gap: space.xs },
  list: { gap: space.s },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 60, borderRadius: radius.card - 4, borderWidth: 1, paddingHorizontal: space.l },
  optEmoji: { fontSize: 24, lineHeight: 30 },
  replyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.s },
  bubble: { flex: 1, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.l, marginBottom: space.l },
  inputBox: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.l, paddingVertical: space.s },
  input: { flex: 1, minWidth: 0, minHeight: 48, fontSize: typeScale.m, padding: 0 },
  nameInput: { fontSize: typeScale.l },
  dice: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  swatches: { flexDirection: 'row', justifyContent: 'center', gap: space.m },
  swatchRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 38, height: 38, borderRadius: 19 },
  bar: { paddingHorizontal: space.gutter, paddingTop: space.m, gap: space.xs },
  btn: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.l, borderBottomWidth: 5 },
  disabled: { opacity: 0.45 },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: space.l },
});
