import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { SlidingNumber } from '@/components/sliding-number';
import { StartSheet } from '@/components/start-sheet';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { daysAway, FOOD, plate } from '@/features/bites/logic';
import { STAGES, stageOf } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { todayKey, type Bite, type Size } from '@/state/schema';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, stages, typeScale } from '@/theme/tokens';

const h = en.home;

const skyOf = (hour: number) => (hour < 6 || hour >= 19 ? 'night' : hour < 11 ? 'morning' : 'day');
const dayIndex = (d: Date) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
const dateLine = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

/**
 * Home. One hero (the pet on its time-of-day stage, glass chips for level and belly), then the
 * plate as an iOS inset-grouped list, Reminders-style: the add field is the first row.
 */
export function HomeScreen() {
  const { colors, scheme, reduceMotion } = useTheme();
  const bites = useAppStore((s) => s.bites);
  const pet = useAppStore((s) => s.pet);
  const stats = useAppStore((s) => s.stats);
  const settings = useAppStore((s) => s.settings);
  const addBites = useAppStore((s) => s.addBites);
  const removeBite = useAppStore((s) => s.removeBite);
  const restoreBite = useAppStore((s) => s.restoreBite);
  const toggleDaily = useAppStore((s) => s.toggleDaily);
  const startFocus = useAppStore((s) => s.startFocus);

  const [openedAt] = useState(() => new Date());
  const [text, setText] = useState('');
  const [size, setSize] = useState<Size>(1);
  const [selected, setSelected] = useState<Bite | null>(null);
  const [reaction, setReaction] = useState<Mood | null>(null);

  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setReaction(null), 1400);
    return () => clearTimeout(t);
  }, [reaction]);

  const today = todayKey(openedAt);
  const list = plate(bites, today);
  const shown = settings.oneThingMode ? list.slice(0, 1) : list;
  const sky = skyOf(openedAt.getHours());
  const stage = stageOf(stats.total);
  const away = daysAway(stats.lastVisit, openedAt);
  const wisdom = en.wisdom[dayIndex(openedAt) % en.wisdom.length];
  const mindful = en.mindful[dayIndex(openedAt) % en.mindful.length];
  const belly = Math.min(1, stats.todayEaten / 4);
  const asleep = sky === 'night' && settings.autoSleep && list.length === 0;
  const baseMood: Mood = asleep ? 'sleepy' : stats.todayEaten >= 4 ? 'love' : stats.todayEaten === 0 && list.length > 0 ? 'hungry' : 'happy';
  const mood = reaction ?? baseMood;
  const stageColors = stages[scheme][sky];
  const onStage = sky === 'night' || scheme === 'dark';

  const add = () => {
    if (!text.trim()) {
      haptics.warning();
      play('nope');
      return;
    }
    addBites([{ text, size }]);
    setText('');
    haptics.light();
    play('pop');
    setReaction('excited');
  };

  const enter = (i: number) =>
    reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(staggerDelay(i));

  return (
    <Screen
      eyebrow={dateLine(openedAt)}
      title={h.greeting(openedAt.getHours())}
      right={
        <View style={[styles.sparks, { backgroundColor: colors.reward }]} accessibilityLabel={`${stats.sparks} sparks`}>
          <Icon name="sparkle" size={14} weight="bold" color={colors.onReward} />
          <SlidingNumber value={stats.sparks} />
        </View>
      }>
      {/* hero: the pet on its stage */}
      <View style={styles.stage}>
        <LinearGradient colors={stageColors} style={StyleSheet.absoluteFill} />
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="72%" r="50%">
              <Stop offset="0" stopColor={colors.onFocus} stopOpacity={onStage ? 0.16 : 0.7} />
              <Stop offset="1" stopColor={colors.onFocus} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="72" r="50" fill="url(#glow)" />
        </Svg>

        <View style={styles.stageTop}>
          <Glass radius={18} shadow={false} style={styles.chip}>
            <Text variant="caption" style={styles.chipText}>{h.level(stage + 1, STAGES[stage].name)}</Text>
          </Glass>
          <Glass radius={18} shadow={false} style={styles.chip}>
            <Text variant="caption" style={styles.chipText}>{h.belly(stats.todayEaten)}</Text>
            <View style={[styles.bellyTrack, { backgroundColor: colors.fill2 }]}>
              <View style={[styles.bellyFill, { width: `${Math.max(10, belly * 100)}%`, backgroundColor: colors.primary }]} />
            </View>
          </Glass>
        </View>

        {away >= 2 ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} style={styles.bubbleWrap}>
            <Glass radius={20} style={styles.bubble}>
              <Text variant="subhead" style={styles.chipText}>{h.comeback(away)}</Text>
            </Glass>
          </Animated.View>
        ) : null}

        <View style={styles.pet}>
          <Pet
            size={128}
            color={pet.color}
            mood={mood}
            accessibilityLabel={`${pet.name}, ${h.belly(stats.todayEaten)}`}
            onPress={() => {
              play('boop');
              setReaction(asleep ? 'tired' : (['excited', 'love', 'celebrating', 'confident'] as Mood[])[Math.floor(Math.random() * 4)]);
            }}
          />
        </View>
      </View>

      {/* one line of pet wisdom */}
      <View style={[styles.note, { backgroundColor: colors.card }]}>
        <View style={[styles.noteIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name="sparkle" size={16} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text variant="caption" tone="ink2">{settings.mindfulNote ? h.mindfulTitle : h.wisdomTitle}</Text>
          <Text variant="body">{settings.mindfulNote ? mindful : wisdom}</Text>
        </View>
      </View>

      {/* the plate */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="title2" accessibilityRole="header">{h.bites}</Text>
          <Text variant="caption" tone="ink2">{h.hint(pet.name)}</Text>
        </View>

        <View style={[styles.list, { backgroundColor: colors.card }]}>
          <View style={styles.addRow}>
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={`${h.sizeLabel}: ${FOOD[size].label}`}
              hitSlop={6}
              onPress={() => {
                setSize(((size + 1) % 4) as Size);
                haptics.select();
                play('tick');
              }}
              style={[styles.food, { backgroundColor: colors.fill }]}>
              <Text style={styles.foodEmoji}>{FOOD[size].emoji}</Text>
            </PressScale>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={add}
              placeholder={h.addPlaceholder}
              placeholderTextColor={colors.ink3}
              returnKeyType="done"
              maxLength={80}
              accessibilityLabel={h.addPlaceholder}
              style={[styles.input, fonts.body, { color: colors.ink }]}
            />
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={h.add}
              hitSlop={6}
              onPress={add}
              style={[styles.addBtn, { backgroundColor: text.trim() ? colors.primary : colors.fill }]}>
              <Icon name="plus" size={18} weight="bold" color={text.trim() ? colors.onPrimary : colors.ink3} />
            </PressScale>
          </View>

          {list.length === 0 ? (
            <View style={[styles.empty, { borderTopColor: colors.line }]}>
              <Text variant="bodyBold" style={styles.center}>{h.emptyTitle(pet.name)}</Text>
              <Text variant="subhead" tone="ink2" style={styles.center}>{h.emptySub}</Text>
              <PressScale accessibilityRole="button" onPress={() => router.push('/dump')} style={[styles.cta, { backgroundColor: colors.primarySoft }]}>
                <Text variant="bodyBold" tone="primary">{h.dump}</Text>
              </PressScale>
            </View>
          ) : (
            shown.map((b, i) => (
              <Animated.View
                key={b.id}
                entering={enter(i)}
                exiting={reduceMotion ? undefined : FadeOut.duration(duration.quick)}
                layout={reduceMotion ? undefined : LinearTransition.duration(duration.fast)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${b.text}. ${FOOD[b.size].label}, about ${FOOD[b.size].min} minutes. tap to start`}
                  onPress={() => {
                    haptics.select();
                    play('pop');
                    setSelected(b);
                  }}>
                  {({ pressed }) => (
                    <View style={[styles.bite, pressed && { backgroundColor: colors.fill }]}>
                      <View style={[styles.food, { backgroundColor: colors.fill }]}>
                        <Text style={styles.foodEmoji}>{FOOD[b.size].emoji}</Text>
                      </View>
                      <View style={[styles.biteBody, { borderTopColor: colors.line }]}>
                        <View style={styles.flex}>
                          <Text variant="body" numberOfLines={2}>{b.text}</Text>
                          <Text variant="caption" tone="ink2">
                            {FOOD[b.size].label} · ~{FOOD[b.size].min} min · +{FOOD[b.size].sparks} ✦
                          </Text>
                        </View>
                        {b.daily ? (
                          <View style={styles.daily} accessibilityLabel={h.dailyOn}>
                            <Icon name="repeat" size={13} weight="bold" color={colors.primary} />
                          </View>
                        ) : null}
                        <Icon name="chevron" size={13} weight="bold" color={colors.ink3} />
                      </View>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
        {settings.oneThingMode && list.length > 1 ? (
          <Text variant="caption" tone="ink2" style={styles.footer}>{h.oneThingMore(list.length - 1)}</Text>
        ) : null}
      </View>

      <StartSheet
        bite={selected}
        defaultTimer={settings.defaultTimer}
        onClose={() => setSelected(null)}
        onToggleDaily={() => {
          if (!selected) return;
          toggleDaily(selected.id);
          haptics.light();
          toast(selected.daily ? h.dailyOff : h.dailyOn);
          setSelected({ ...selected, daily: !selected.daily });
        }}
        onRemove={() => {
          if (!selected) return;
          const removed = removeBite(selected.id);
          setSelected(null);
          haptics.light();
          if (removed) toast(h.removed, { label: h.undo, onPress: () => restoreBite(removed) });
        }}
        onStart={(minutes, mode) => {
          if (!selected) return;
          startFocus({ id: selected.id, text: selected.text, size: selected.size }, minutes, mode);
          setSelected(null);
          haptics.medium();
          play('spark');
          router.push('/focus');
          setTimeout(() => toast(en.focus.started), 450);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  sparks: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.m, height: 32, borderRadius: radius.chip, marginBottom: space.xs },
  stage: { height: 330, borderRadius: radius.scene, overflow: 'hidden' },
  stageTop: { flexDirection: 'row', justifyContent: 'space-between', padding: space.m, gap: space.s },
  chip: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.m, height: 36 },
  chipText: { fontWeight: '600' },
  bellyTrack: { width: 44, height: 6, borderRadius: 3, overflow: 'hidden' },
  bellyFill: { height: '100%', borderRadius: 3 },
  bubbleWrap: { position: 'absolute', top: 64, start: space.xl, end: space.xl, alignItems: 'center' },
  bubble: { paddingHorizontal: space.l, paddingVertical: space.m },
  pet: { position: 'absolute', bottom: 10, start: 0, end: 0, alignItems: 'center' },
  note: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderRadius: radius.card - 6, padding: space.l },
  noteIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: { gap: space.m },
  sectionHead: { gap: 2, paddingHorizontal: space.xs },
  list: { borderRadius: radius.card, overflow: 'hidden' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.m, minHeight: 64 },
  input: { flex: 1, minHeight: 44, fontSize: typeScale.body },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  food: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 22, lineHeight: 28 },
  bite: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingStart: space.m },
  biteBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 64, paddingVertical: space.s + 2, paddingEnd: space.l, borderTopWidth: StyleSheet.hairlineWidth },
  daily: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.s, padding: space.xl, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { marginTop: space.s, minHeight: 44, paddingHorizontal: space.xl, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: space.l },
});
