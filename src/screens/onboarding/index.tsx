import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
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
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Chips } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { APP_NAME } from '@/config/app';
import { guessSize } from '@/features/bites/chop';
import { COLORS } from '@/features/closet/items';
import { capFirst } from '@/features/bites/logic';
import { askNotificationPermission } from '@/features/nudges/schedule';
import { track } from '@/lib/analytics';
import { ONBOARDING_STEPS } from '@/lib/analytics-events';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { Burst } from '@/pet/burst';
import { Egg } from '@/pet/egg';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, petColors, radius, space, stages, typeScale, type PetColor } from '@/theme/tokens';

import { BiteIcon } from '@/components/bite-icon';
import { FoodIcon } from '@/components/food-icon';

const o = en.onboarding;
type Step = 'hook' | 'quiz' | 'feed' | 'hatch' | 'name' | 'nudge';
const DOTS: Step[] = ['hook', 'quiz', 'feed', 'name', 'nudge'];
/** the free colours (the rest are unlocked by levels or Plus, src/features/closet/items.ts) */
const START_COLORS = COLORS.filter((c) => c.unlock.type === 'free');
const ORBIT = [0, 1, 2, 3] as const;

/**
 * Onboarding (docs/01 §0 + DECISIONS "hatch by feeding"), under 60 s, no paywall, no account:
 * hook → one quiz screen → feed the egg your first thought (it hatches *because it ate*) →
 * name it (dice) + colour → soft nudge ask (the OS prompt only after "yes") → Home.
 */
export function OnboardingScreen() {
  const { colors, scheme, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const addBites = useAppStore((s) => s.addBites);
  const patchPet = useAppStore((s) => s.patchPet);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [step, setStep] = useState<Step>('hook');
  const [picked, setPicked] = useState<string[]>([]);
  const [thought, setThought] = useState('');
  const [cracks, setCracks] = useState(0);
  const [hatched, setHatched] = useState(false);
  const [burst, setBurst] = useState(0);
  const [name, setName] = useState<string>(() => o.names[Math.floor(Math.random() * o.names.length)]);
  const [color, setColor] = useState<PetColor>('caramel');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  // the food flying into the egg
  const fly = useSharedValue(0);
  const flyStyle = useAnimatedStyle(() => {
    const p = fly.get();
    return {
      opacity: p === 0 || p >= 1 ? 0 : 1,
      transform: [{ translateY: 230 * (1 - p) - Math.sin(p * Math.PI) * 60 }, { scale: 1 - p * 0.6 }, { rotate: `${p * 200}deg` }],
    };
  });

  const go = (s: Step) => {
    haptics.select();
    track('onboarding_step', { step: s, index: ONBOARDING_STEPS.indexOf(s) });
    setStep(s);
  };

  const feed = () => {
    const text = thought.trim();
    if (!text) {
      haptics.warning();
      play('nope');
      return;
    }
    Keyboard.dismiss();
    addBites([{ text, size: guessSize(text) }]);
    play('pop');
    haptics.light();
    setStep('hatch');
    const crack = reduceMotion ? 250 : 520;
    if (!reduceMotion) fly.set(withSequence(withTiming(0.001, { duration: 0 }), withTiming(1, { duration: 480, easing: Easing.bezier(0.33, 0, 0.67, 1) })));
    later(crack, () => { setCracks(1); haptics.light(); play('tick'); });
    later(crack * 2, () => { setCracks(2); haptics.medium(); play('tick'); });
    later(crack * 3, () => { setCracks(3); haptics.heavy(); play('boop'); });
    later(crack * 4, () => {
      setHatched(true);
      setBurst(1);
      haptics.success();
      play('spark');
    });
    later(crack * 4 + 1700, () => setStep('name'));
  };

  const finishing = useRef(false);
  const finish = async (nudges: boolean) => {
    if (finishing.current) return; // a double tap must not ask twice or navigate twice
    finishing.current = true;
    haptics.light();
    if (nudges) await askNotificationPermission().catch(() => false);
    updateSettings({ nudge: nudges ? 'gentle' : 'off', onboarded: true });
    router.replace('/');
    setTimeout(() => toast(o.welcome(name.trim() || 'Pip')), 500);
  };

  const enter = reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.medium);
  const exit = FadeOut.duration(duration.quick);
  const line = o.quiz.find((q) => q.key === picked[picked.length - 1])?.line;
  const dot = step === 'hatch' ? 'feed' : step;

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={stages[scheme].day} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.fill, { paddingTop: insets.top + space.l, paddingBottom: Math.max(insets.bottom, space.l) }]}>
          <View style={styles.dots} accessibilityElementsHidden>
            {DOTS.map((d) => (
              <View key={d} style={[styles.dot, { backgroundColor: d === dot ? colors.primary : colors.fill2, width: d === dot ? 22 : 7 }]} />
            ))}
          </View>

          {step === 'hook' && (
            <Animated.View key="hook" entering={enter} exiting={exit} style={styles.page}>
              <View style={styles.hero}>
                <Orbit />
                <Egg size={170} />
              </View>
              <View style={styles.copy}>
                <Text variant="title" style={styles.center}>{o.hookTitle}</Text>
                <Text variant="title" tone="primary" style={styles.center}>{o.hookTitle2}</Text>
                <Text variant="body" tone="ink2" style={[styles.center, styles.sub]}>{o.hookSub}</Text>
              </View>
              <Primary label={o.hookCta} onPress={() => go('quiz')} />
            </Animated.View>
          )}

          {step === 'quiz' && (
            <Animated.View key="quiz" entering={enter} exiting={exit} style={styles.page}>
              <View style={styles.copyTop}>
                <Text variant="title" accessibilityRole="header">{o.quizTitle}</Text>
                <Text variant="body" tone="ink2">{o.quizSub}</Text>
              </View>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                {o.quiz.map((q, i) => {
                  const on = picked.includes(q.key);
                  return (
                    <PressScale
                      key={q.key}
                      pressedScale={0.99}
                      accessibilityRole="checkbox"
                      accessibilityLabel={q.label}
                      accessibilityState={{ checked: on }}
                      onPress={() => {
                        haptics.select();
                        setPicked((p) => (on ? p.filter((k) => k !== q.key) : [...p, q.key]));
                      }}
                      style={[styles.quizRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
                      <Text variant="body" style={styles.flex}>{q.label}</Text>
                      <View style={[styles.check, on ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.ink3 }]}>
                        {on ? <Icon name="check" size={13} weight="bold" color={colors.onPrimary} /> : null}
                      </View>
                    </PressScale>
                  );
                })}
              </View>
              <View style={styles.lineBox}>
                {line ? (
                  <Animated.View key={line} entering={FadeIn.duration(duration.fast)} style={styles.lineRow}>
                    <Egg size={40} />
                    <Text variant="subhead" tone="ink2" style={styles.flex}>{line}</Text>
                  </Animated.View>
                ) : null}
              </View>
              <View style={styles.actions}>
                <Primary label={picked.length ? o.next : o.skip} onPress={() => go('feed')} soft={!picked.length} />
              </View>
            </Animated.View>
          )}

          {(step === 'feed' || step === 'hatch') && (
            <Animated.View key="feed" entering={enter} exiting={exit} style={styles.page}>
              <View style={styles.copyTop}>
                <Text variant="title" accessibilityRole="header">{hatched ? o.hatched : step === 'hatch' ? o.hatching : o.feedTitle}</Text>
                {step === 'feed' ? <Text variant="body" tone="ink2">{o.feedSub}</Text> : null}
              </View>
              <View style={styles.hero}>
                <Burst id={burst} size={300} />
                {hatched ? (
                  <Animated.View entering={reduceMotion ? FadeIn : FadeIn.duration(200)}>
                    <Pet size={160} color={color} mood="excited" />
                  </Animated.View>
                ) : (
                  <Egg size={160} cracks={cracks} wobble />
                )}
                <Animated.View pointerEvents="none" style={[styles.flying, flyStyle]}>
                  <BiteIcon text={thought} size={guessSize(thought || 'x')} px={40} />
                </Animated.View>
              </View>
              {step === 'feed' ? (
                <View style={[styles.feedRow, { backgroundColor: colors.card }]}>
                  <View style={[styles.food, { backgroundColor: colors.fill }]}>
                    <BiteIcon text={thought} size={guessSize(thought || 'x')} />
                  </View>
                  <TextInput
                    value={thought}
                    onChangeText={setThought}
                    onSubmitEditing={feed}
                    placeholder={o.feedPlaceholder}
                    placeholderTextColor={colors.ink3}
                    returnKeyType="done"
                    maxLength={80}
                    autoFocus={Platform.OS !== 'web'}
                    accessibilityLabel={o.feedSub}
                    style={[styles.input, fonts.body, styles.noOutline, { color: colors.ink }]}
                  />
                  <PressScale accessibilityRole="button" onPress={feed} style={[styles.feedBtn, { backgroundColor: thought.trim() ? colors.primary : colors.fill }]}>
                    <Text variant="bodyBold" tone={thought.trim() ? 'onPrimary' : 'ink3'}>{o.feedCta}</Text>
                  </PressScale>
                </View>
              ) : (
                <View style={styles.feedRow} />
              )}
            </Animated.View>
          )}

          {step === 'name' && (
            <Animated.View key="name" entering={enter} exiting={exit} style={styles.page}>
              <View style={styles.copyTop}>
                <Text variant="title" accessibilityRole="header">{o.nameTitle}</Text>
                <Text variant="body" tone="ink2">{o.nameSub}</Text>
              </View>
              <View style={styles.hero}>
                <Pet size={150} color={color} mood="happy" onPress={() => play('boop')} />
              </View>
              <View style={[styles.card, styles.nameCard, { backgroundColor: colors.card }]}>
                <View style={styles.nameRow}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={o.namePlaceholder}
                    placeholderTextColor={colors.ink3}
                    maxLength={16}
                    autoCapitalize="words"
                    returnKeyType="done"
                    accessibilityLabel={o.namePlaceholder}
                    style={[styles.nameInput, fonts.display, styles.noOutline, { color: colors.ink, backgroundColor: colors.fill }]}
                  />
                  <PressScale
                    accessibilityRole="button"
                    accessibilityLabel={o.dice}
                    onPress={() => {
                      const pool = o.names.filter((n) => n !== name);
                      setName(pool[Math.floor(Math.random() * pool.length)]);
                      haptics.light();
                      play('tick');
                    }}
                    style={[styles.dice, { backgroundColor: colors.primarySoft }]}>
                    <Icon name="spin" size={22} color={colors.primaryInk} />
                  </PressScale>
                </View>
                <Chips<PetColor>
                  accessibilityLabel="Colour"
                  value={color}
                  onChange={setColor}
                  options={START_COLORS.map((c) => ({ value: c.id, label: c.name, swatch: petColors[c.id] }))}
                />
              </View>
              <Primary
                label={o.meet(name.trim() || 'Pip')}
                onPress={() => {
                  patchPet({ name: capFirst(name.trim()) || 'Pip', color });
                  go('nudge');
                }}
              />
            </Animated.View>
          )}

          {step === 'nudge' && (
            <Animated.View key="nudge" entering={enter} exiting={exit} style={styles.page}>
              <View style={styles.hero}>
                <View style={[styles.bell, { backgroundColor: colors.card }]}>
                  <Icon name="bell" size={30} color={colors.primaryInk} />
                </View>
                <Pet size={130} color={color} mood="curious" />
              </View>
              <View style={styles.copy}>
                <Text variant="title" style={styles.center}>{o.nudgeTitle(name.trim() || 'Pip')}</Text>
                <Text variant="body" tone="ink2" style={[styles.center, styles.sub]}>{o.nudgeSub}</Text>
                <Text variant="caption" tone="ink2" style={[styles.center, styles.sub]}>{o.usageNote(APP_NAME)}</Text>
              </View>
              <View style={styles.actions}>
                <Primary label={o.nudgeYes} onPress={() => void finish(true)} />
                <Primary label={o.nudgeNo} soft onPress={() => void finish(false)} />
              </View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Primary({ label, onPress, soft }: { label: string; onPress: () => void; soft?: boolean }) {
  const { colors } = useTheme();
  return (
    <PressScale accessibilityRole="button" onPress={onPress} style={[styles.primary, { backgroundColor: soft ? colors.fill : colors.primary }]}>
      <Text variant="bodyBold" tone={soft ? 'ink' : 'onPrimary'}>{label}</Text>
    </PressScale>
  );
}

/** Food slowly orbiting the egg on the hook screen. */
function Orbit() {
  const { reduceMotion } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) t.set(withDelay(200, withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1)));
  }, [reduceMotion, t]);
  return (
    <>
      {ORBIT.map((e, i) => (
        <OrbitItem key={e} size={e} index={i} t={t} />
      ))}
    </>
  );
}

function OrbitItem({ size, index, t }: { size: 0 | 1 | 2 | 3; index: number; t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const a = (t.get() + index / ORBIT.length) * Math.PI * 2;
    return { transform: [{ translateX: Math.cos(a) * 130 }, { translateY: Math.sin(a) * 46 + 10 }, { scale: 0.85 + Math.sin(a) * 0.2 }], zIndex: Math.sin(a) > 0 ? 2 : 0 };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.orbit, style]}>
      <FoodIcon size={size} px={26} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, height: 7, marginBottom: space.l },
  dot: { height: 7, borderRadius: 4 },
  page: { flex: 1, paddingHorizontal: space.xl, justifyContent: 'space-between', gap: space.l },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: space.xs },
  copyTop: { gap: space.xs, paddingTop: space.s },
  sub: { marginTop: space.s },
  card: { borderRadius: radius.card, overflow: 'hidden' },
  quizRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, paddingHorizontal: space.l },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  lineBox: { minHeight: 52, justifyContent: 'center' },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  actions: { gap: space.s },
  primary: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  feedRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, borderRadius: radius.card, padding: space.s, minHeight: 64 },
  food: { flexShrink: 0, width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 24, lineHeight: 30 },
  input: { flex: 1, minWidth: 0, minHeight: 44, fontSize: typeScale.body },
  noOutline: Platform.select({ web: { outlineStyle: 'none' }, default: {} }) as object,
  feedBtn: { flexShrink: 0, minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  flying: { position: 'absolute' },
  flyEmoji: { fontSize: 44, lineHeight: 52 },
  nameCard: { padding: space.l, gap: space.l, overflow: 'visible' },
  nameRow: { flexDirection: 'row', gap: space.s },
  nameInput: { flex: 1, minWidth: 0, minHeight: 52, borderRadius: radius.field, paddingHorizontal: space.l, fontSize: typeScale.title3 },
  dice: { flexShrink: 0, width: 52, height: 52, borderRadius: radius.field, alignItems: 'center', justifyContent: 'center' },
  diceEmoji: { fontSize: 24, lineHeight: 30 },
  bell: { position: 'absolute', top: '12%', end: '18%', width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] },
  orbit: { position: 'absolute' },
  orbitEmoji: { fontSize: 30, lineHeight: 36 },
});
