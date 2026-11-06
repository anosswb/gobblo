import { Sparkle, X } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { FOOD } from '@/features/bites/logic';
import { parseDump, type ParsedBite } from '@/features/dump/parse';
import { haptics } from '@/lib/haptics';
import { backOrHome } from '@/lib/nav';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import type { Size } from '@/state/schema';
import { distance, duration, spring, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

const t = en.dump;

type Item = ParsedBite & { key: string };
let keySeq = 0;

/** Food emoji "pop" when the size changes: from 0.6, never from 0 (.claude/rules/animation.md). */
const foodPop = () => {
  'worklet';
  return {
    initialValues: { transform: [{ scale: 0.6 }] },
    animations: { transform: [{ scale: withSpring(1, spring.pop) }] },
  };
};

/**
 * Brain dump (docs/01 §5): type everything, "chop it into bites", fix sizes and words,
 * then serve them all to Home. Plain rules, no AI, no ads (CLAUDE.md).
 */
export function DumpScreen() {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const petName = useAppStore((s) => s.pet.name);
  const addBites = useAppStore((s) => s.addBites);
  const [raw, setRaw] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const scroll = useRef<ScrollViewInstance>(null);

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.get() }] }));

  const shake = () => {
    if (reduceMotion) return;
    const seg = { duration: duration.micro };
    shakeX.set(
      withSequence(
        withTiming(-distance.base, seg),
        withTiming(distance.base, seg),
        withTiming(-distance.small, seg),
        withTiming(distance.small, seg),
        withTiming(0, seg),
      ),
    );
  };

  const chop = () => {
    if (!raw.trim()) {
      shake();
      haptics.warning();
      play('nope');
      toast(t.empty);
      return;
    }
    const parsed = parseDump(raw);
    if (!parsed.length) {
      shake();
      haptics.warning();
      toast(t.none);
      return;
    }
    setItems(parsed.map((p) => ({ ...p, key: `p${keySeq++}` })));
    haptics.medium();
    parsed.slice(0, 6).forEach((_, i) => setTimeout(() => play('pop'), staggerDelay(i, duration.micro)));
    setTimeout(() => scroll.current?.scrollToEnd({ animated: !reduceMotion }), duration.fast);
  };

  const cycle = (key: string) => {
    haptics.select();
    play('tick');
    setItems((list) => list.map((it) => (it.key === key ? { ...it, size: (((it.size + 1) % 4) as Size) } : it)));
  };

  const edit = (key: string, text: string) => setItems((list) => list.map((it) => (it.key === key ? { ...it, text } : it)));

  const remove = (key: string) => {
    haptics.light();
    setItems((list) => list.filter((it) => it.key !== key));
  };

  const serve = () => {
    const ready = items.filter((it) => it.text.trim());
    if (!ready.length) return;
    addBites(ready.map(({ text, size }) => ({ text, size })));
    haptics.success();
    play('spark');
    backOrHome();
    setTimeout(() => toast(t.served(ready.length)), duration.slow);
  };

  const itemIn = (i: number) =>
    reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.delay(staggerDelay(i)).duration(duration.fast).withInitialValues({ transform: [{ translateY: distance.medium }] });
  const ready = items.filter((it) => it.text.trim()).length;

  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.m, paddingBottom: space.xxl * 3 }]}>
        <PressScale accessibilityRole="button" accessibilityLabel={t.close} hitSlop={12} onPress={backOrHome}
          style={[styles.close, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <X size={22} weight="bold" color={colors.ink} />
        </PressScale>

        <View style={styles.head}>
          <Text variant="title">{t.title}</Text>
          <Text tone="ink2">{t.sub}</Text>
        </View>

        <Animated.View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.line }, shakeStyle]}>
          <TextInput
            value={raw}
            onChangeText={setRaw}
            multiline
            autoFocus={false}
            textAlignVertical="top"
            placeholder={t.placeholder}
            placeholderTextColor={colors.ink3}
            accessibilityLabel={t.inputLabel}
            maxLength={2000}
            style={[styles.input, { color: colors.ink, fontFamily: fonts.body }]}
          />
          <View style={styles.chips}>
            <PressScale accessibilityRole="button" onPress={() => { setRaw(t.exampleText); haptics.light(); play('pop'); }}
              style={[styles.chip, { backgroundColor: colors.cardAlt }]}>
              <Text variant="caption">{t.example}</Text>
            </PressScale>
            {raw.length > 0 ? (
              <PressScale accessibilityRole="button" onPress={() => { setRaw(''); setItems([]); haptics.light(); }}
                style={[styles.chip, { backgroundColor: colors.cardAlt }]}>
                <Text variant="caption" tone="ink2">{t.clear}</Text>
              </PressScale>
            ) : null}
          </View>
        </Animated.View>

        <PressScale accessibilityRole="button" onPress={chop}
          style={[styles.btn, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep }]}>
          <Text variant="bodyBold" tone="onPrimary">{t.chop}</Text>
        </PressScale>

        {items.length > 0 ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} style={styles.preview}>
            <View style={styles.head}>
              <Text variant="heading">{t.previewTitle(items.length)}</Text>
              <Text variant="caption" tone="ink2">{t.previewHint}</Text>
            </View>
            {items.map((it, i) => (
              <Animated.View key={it.key} entering={itemIn(i)} exiting={reduceMotion ? undefined : FadeOut.duration(duration.quick)}
                layout={reduceMotion || Platform.OS === 'web' ? undefined : LinearTransition.springify().stiffness(spring.firm.stiffness).damping(spring.firm.damping).mass(spring.firm.mass)}
                style={[styles.item, { backgroundColor: colors.card, borderColor: colors.line }]}>
                <PressScale accessibilityRole="button" accessibilityLabel={t.resize(it.text, FOOD[it.size].label)} onPress={() => cycle(it.key)}
                  style={[styles.food, { backgroundColor: colors.cardAlt }]}>
                  <Animated.Text key={it.size} entering={reduceMotion ? undefined : foodPop} style={styles.foodEmoji}>
                    {FOOD[it.size].emoji}
                  </Animated.Text>
                </PressScale>
                <View style={styles.flex}>
                  <TextInput
                    value={it.text}
                    onChangeText={(v) => edit(it.key, v)}
                    maxLength={120}
                    multiline
                    submitBehavior="blurAndSubmit"
                    returnKeyType="done"
                    accessibilityLabel={it.text}
                    style={[styles.itemInput, { color: colors.ink, fontFamily: fonts.bodyBold }]}
                  />
                  <Text variant="caption" tone="ink3">{FOOD[it.size].label} · ~{FOOD[it.size].min} min · +{FOOD[it.size].sparks} ✦</Text>
                </View>
                <PressScale accessibilityRole="button" accessibilityLabel={t.remove(it.text)} hitSlop={8} onPress={() => remove(it.key)} style={styles.x}>
                  <X size={18} weight="bold" color={colors.ink3} />
                </PressScale>
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}
      </ScrollView>

      {ready > 0 ? (
        <Animated.View entering={FadeIn.duration(duration.fast)} style={[styles.bar, { paddingBottom: insets.bottom + space.m, backgroundColor: colors.bg, borderTopColor: colors.line }]}>
          <PressScale accessibilityRole="button" onPress={serve}
            style={[styles.btn, styles.serve, { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep }]}>
            <Sparkle size={20} weight="fill" color={colors.onReward} />
            <Text variant="bodyBold" tone="onReward">{t.serve(ready, petName)}</Text>
          </PressScale>
        </Animated.View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.gutter, gap: space.l },
  close: { alignSelf: 'flex-end', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  head: { gap: space.xs },
  box: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.l, gap: space.m },
  input: { minHeight: 150, fontSize: typeScale.m, lineHeight: 24, padding: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { minHeight: 36, paddingHorizontal: space.m, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  btn: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.l, borderBottomWidth: 5 },
  preview: { gap: space.s },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderRadius: radius.card - 4, borderWidth: StyleSheet.hairlineWidth, padding: space.m, minHeight: 68 },
  food: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 26, lineHeight: 32 },
  itemInput: { fontSize: typeScale.m, padding: 0, minHeight: 28 },
  x: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  bar: { position: 'absolute', start: 0, end: 0, bottom: 0, paddingHorizontal: space.gutter, paddingTop: space.m, borderTopWidth: StyleSheet.hairlineWidth },
  serve: { flexDirection: 'row', gap: space.s },
});
