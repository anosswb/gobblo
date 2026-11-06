import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowsClockwise, Plus, Sparkle } from 'phosphor-react-native';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

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
import { PetStandin } from '@/pet/pet-standin';
import { useAppStore } from '@/state/app-store';
import { todayKey, type Bite, type Size } from '@/state/schema';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

const h = en.home;

const SCENES = {
  morning: require('@/assets/images/scene-morning.jpg'),
  day: require('@/assets/images/scene-day.jpg'),
  night: require('@/assets/images/scene-night.jpg'),
};
const skyOf = (hour: number) => (hour < 6 || hour >= 19 ? 'night' : hour < 11 ? 'morning' : 'day');
const dayIndex = (d: Date) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);

/**
 * Phase-1.5 Home: usable now (add, start, repeat daily, delete + undo, one-thing mode,
 * pet wisdom, mindful note). Phase 3 adds the real pet, drag-to-feed and the brain dump.
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

  const today = todayKey(openedAt);
  const list = plate(bites, today);
  const shown = settings.oneThingMode ? list.slice(0, 1) : list;
  const sky = skyOf(openedAt.getHours());
  const stage = stageOf(stats.total);
  const away = daysAway(stats.lastVisit, openedAt);
  const wisdom = en.wisdom[dayIndex(openedAt) % en.wisdom.length];
  const mindful = en.mindful[dayIndex(openedAt) % en.mindful.length];
  const belly = Math.min(1, stats.todayEaten / 4);

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
  };

  const enter = (i: number) =>
    reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(staggerDelay(i));

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text variant="caption" tone="ink2">{h.greeting(openedAt.getHours())}</Text>
          <Text variant="title">{h.title}</Text>
        </View>
        <View style={[styles.sparks, { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep }]} accessibilityLabel={`${stats.sparks} sparks`}>
          <Sparkle size={16} weight="fill" color={colors.onReward} />
          <SlidingNumber value={stats.sparks} />
        </View>
      </View>

      <View style={[styles.scene, { borderColor: colors.line }]}>
        <Image source={SCENES[sky]} style={StyleSheet.absoluteFill} contentFit="cover" />
        {scheme === 'dark' && sky !== 'night' ? <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.sceneDim }]} /> : null}
        <View style={styles.sceneTop}>
          <View style={[styles.glassChip, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text variant="caption">{h.level(stage + 1, STAGES[stage].name)}</Text>
          </View>
          <View style={[styles.glassChip, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text variant="caption">{h.belly(stats.todayEaten)}</Text>
            <View style={[styles.bellyTrack, { backgroundColor: colors.line }]}>
              <View style={[styles.bellyFill, { width: `${Math.max(8, belly * 100)}%`, backgroundColor: colors.pink }]} />
            </View>
          </View>
        </View>
        {away >= 2 ? (
          <View style={[styles.bubble, { backgroundColor: colors.card }]}>
            <Text variant="bodyBold">{h.comeback(away)}</Text>
          </View>
        ) : null}
        <View style={styles.pet}>
          <PetStandin size={130} color={pet.color} sleepy={sky === 'night' && settings.autoSleep && list.length === 0} />
        </View>
      </View>

      <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.line }]}>
        <Text variant="caption" tone="primary">{settings.mindfulNote ? h.mindfulTitle : h.wisdomTitle}</Text>
        <Text variant="bodyBold">{settings.mindfulNote ? mindful : wisdom}</Text>
      </View>

      <View style={styles.listHead}>
        <Text variant="heading">{h.bites}</Text>
        <Text variant="caption" tone="ink2">{h.hint(pet.name)}</Text>
      </View>

      <View style={[styles.addRow, { backgroundColor: colors.card, borderColor: colors.line }]}>
        <PressScale accessibilityRole="button" accessibilityLabel={`${h.sizeLabel}: ${FOOD[size].label}`} hitSlop={6}
          onPress={() => { setSize(((size + 1) % 4) as Size); haptics.select(); play('tick'); }} style={[styles.food, { backgroundColor: colors.cardAlt }]}>
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
          style={[styles.input, { color: colors.ink, fontFamily: fonts.bodyBold }]}
        />
        <PressScale accessibilityRole="button" accessibilityLabel={h.add} onPress={add} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Plus size={20} weight="bold" color={colors.onPrimary} />
        </PressScale>
      </View>

      {list.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <Text style={styles.plate}>🍽️</Text>
          <Text variant="heading">{h.emptyTitle(pet.name)}</Text>
          <Text tone="ink2" style={styles.center}>{h.emptySub}</Text>
          <PressScale accessibilityRole="button" onPress={() => router.push('/dump')} style={[styles.cta, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep }]}>
            <Text variant="bodyBold" tone="onPrimary">{h.dump}</Text>
          </PressScale>
        </View>
      ) : (
        <View style={styles.list}>
          {shown.map((b, i) => (
            <Animated.View key={b.id} entering={enter(i)} exiting={reduceMotion ? undefined : FadeOutLeft.duration(duration.fast)} layout={reduceMotion ? undefined : LinearTransition.springify()}>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={`${b.text}. ${FOOD[b.size].label}, about ${FOOD[b.size].min} minutes. tap to start`}
                onPress={() => { haptics.select(); play('pop'); setSelected(b); }}
                style={[styles.bite, { backgroundColor: colors.card, borderColor: colors.line, shadowColor: colors.shadow }]}>
                <View style={[styles.food, { backgroundColor: colors.cardAlt }]}>
                  <Text style={styles.foodEmoji}>{FOOD[b.size].emoji}</Text>
                </View>
                <View style={styles.flex}>
                  <Text variant="bodyBold" numberOfLines={2}>{b.text}</Text>
                  <Text variant="caption" tone="ink3">{FOOD[b.size].label} · ~{FOOD[b.size].min} min · +{FOOD[b.size].sparks} ✦</Text>
                </View>
                {b.daily ? (
                  <View style={[styles.daily, { backgroundColor: colors.cardAlt }]} accessibilityLabel={h.dailyOn}>
                    <ArrowsClockwise size={14} weight="bold" color={colors.primary} />
                    <Text variant="caption" tone="primary">{h.daily}</Text>
                  </View>
                ) : null}
              </PressScale>
            </Animated.View>
          ))}
          {settings.oneThingMode && list.length > 1 ? (
            <Text variant="caption" tone="ink3" style={styles.center}>{h.oneThingMore(list.length - 1)}</Text>
          ) : null}
        </View>
      )}

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
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.m },
  sparks: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.m, minHeight: 36, borderRadius: radius.chip, borderBottomWidth: 3 },
  scene: { height: 300, borderRadius: radius.scene, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  sceneTop: { flexDirection: 'row', justifyContent: 'space-between', padding: space.l, gap: space.s },
  glassChip: { flexDirection: 'row', alignItems: 'center', gap: space.s, borderRadius: radius.chip, paddingHorizontal: space.m, minHeight: 34, borderWidth: 1 },
  bellyTrack: { width: 48, height: 8, borderRadius: 4, overflow: 'hidden' },
  bellyFill: { height: '100%', borderRadius: 4 },
  bubble: { position: 'absolute', top: 64, start: space.xl, end: space.xl, borderRadius: radius.card, padding: space.m },
  pet: { position: 'absolute', bottom: 8, start: 0, end: 0, alignItems: 'center' },
  note: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.l, gap: space.xs },
  listHead: { gap: 2 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.s },
  input: { flex: 1, minHeight: 44, fontSize: typeScale.m },
  addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  food: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 24, lineHeight: 30 },
  list: { gap: space.s },
  bite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    borderRadius: radius.card - 4,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.m,
    minHeight: 68,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  daily: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.s, minHeight: 26, borderRadius: radius.chip },
  empty: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.xl, alignItems: 'center', gap: space.s },
  plate: { fontSize: 44, lineHeight: 52 },
  cta: { marginTop: space.s, minHeight: 52, paddingHorizontal: space.xl, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5 },
});
