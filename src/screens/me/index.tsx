import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Glass } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { SlidingNumber } from '@/components/sliding-number';
import { Text } from '@/components/text';
import { STAGES, hourBuckets, stageProgress, weekBuckets, weekMeter } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

import { BrainCard } from './brain-card';
import { LevelRing } from './level-ring';
import { WeekChart } from './week-chart';

/**
 * Me = personal progress dashboard (docs/12 #4, #11): all data on the phone, no analytics SDK.
 * Stage, 4 stat tiles, interactive week chart, a weekly meter that never "breaks",
 * best hours, the shareable brain card and the optional good things jar.
 */
export function MeScreen() {
  const { colors } = useTheme();
  const stats = useAppStore((s) => s.stats);
  const pet = useAppStore((s) => s.pet);
  const sessions = useAppStore((s) => s.sessions);
  const settings = useAppStore((s) => s.settings);
  const goodThings = useAppStore((s) => s.goodThings);
  const addGoodThing = useAppStore((s) => s.addGoodThing);
  const removeGoodThing = useAppStore((s) => s.removeGoodThing);

  const [openedAt] = useState(() => new Date());
  const [metric, setMetric] = useState<'bites' | 'minutes'>('bites');
  const [good, setGood] = useState('');

  const st = stageProgress(stats.total);
  const days = weekBuckets(sessions, openedAt, settings.weekStartsMonday);
  const meter = weekMeter(days);
  const hours = hourBuckets(sessions);
  const maxHour = Math.max(1, ...hours);

  const tiles: { label: string; value: number; icon: IconName }[] = [
    { label: 'bites eaten', value: stats.eaten, icon: 'check' },
    { label: 'minutes focused', value: stats.minutes, icon: 'timer' },
    { label: 'comeback days', value: stats.comebacks, icon: 'repeat' },
    { label: 'all-time sparks', value: stats.total, icon: 'sparkle' },
  ];

  return (
    <Screen
      eyebrow={`you + ${pet.name}`}
      title="progress"
      right={
        <PressScale accessibilityRole="button" accessibilityLabel="settings" hitSlop={4} onPress={() => router.push('/settings')}>
          <Glass interactive radius={22} style={styles.gear}>
            <Icon name="gear" size={20} color={colors.ink} />
          </Glass>
        </PressScale>
      }>
      <View style={[styles.card, styles.levelCard, { backgroundColor: colors.card }]}>
        <LevelRing progress={st.toNext === null ? 1 : st.progress} color={pet.color} stage={st.stage} mood={st.toNext === null ? 'confident' : 'proud'} />
        <View style={styles.flex}>
          <Text variant="caption" tone="primary" style={styles.kicker}>level {st.stage + 1}</Text>
          <Text variant="title2">{STAGES[st.stage].name}</Text>
          <Text variant="subhead" tone="ink2">{st.toNext === null ? 'max level. menace.' : `${st.toNext} ✦ to evolve`}</Text>
        </View>
      </View>

      <View style={styles.tiles}>
        {tiles.map((t) => (
          <View key={t.label} style={[styles.tile, { backgroundColor: colors.card }]} accessibilityLabel={`${t.label}: ${t.value}`}>
            <View style={styles.tileHead}>
              <Icon name={t.icon} size={14} weight="bold" color={colors.primary} />
              <Text variant="caption" tone="ink2">{t.label}</Text>
            </View>
            <SlidingNumber value={t.value} tone="ink" big />
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.rowBetween}>
          <Text variant="heading">this week</Text>
          <Text variant="bodyBold" tone="primary">{meter.bites}/{meter.goal}</Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.fill }]}>
          <View style={[styles.fill, { width: `${Math.max(4, meter.progress * 100)}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text variant="subhead" tone="ink2">
          {meter.daysFed === 0 ? 'a fresh week. one bite starts it.' : `you showed up on ${meter.daysFed} ${meter.daysFed === 1 ? 'day' : 'days'}. it refills every week, nothing to lose.`}
        </Text>
        <Segmented accessibilityLabel="chart shows" value={metric} onChange={setMetric}
          options={[{ value: 'bites', label: 'bites' }, { value: 'minutes', label: 'minutes' }]} />
        <WeekChart days={days} metric={metric} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text variant="heading">your best hours</Text>
        <View style={styles.heat} accessibilityLabel="bites finished by hour of day">
          {hours.map((n, hIdx) => (
            <View key={hIdx} style={[styles.cell, { backgroundColor: colors.primary, opacity: 0.08 + 0.92 * (n / maxHour) }]} />
          ))}
        </View>
        <View style={styles.rowBetween}>
          {['12a', '6a', '12p', '6p', '12a'].map((l, i) => (
            <Text key={i} variant="caption" tone="ink3">{l}</Text>
          ))}
        </View>
      </View>

      <BrainCard />

      {(settings.goodThingsJar || goodThings.length > 0) && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text variant="heading">good things jar</Text>
          <Text variant="caption" tone="ink2">one small good thing from today. totally optional.</Text>
          <View style={[styles.addRow, { backgroundColor: colors.fill }]}>
            <TextInput value={good} onChangeText={setGood} placeholder="the coffee was perfect…" placeholderTextColor={colors.ink3}
              maxLength={120} returnKeyType="done" accessibilityLabel="add a good thing"
              onSubmitEditing={() => {
                if (!good.trim()) return;
                addGoodThing(good);
                setGood('');
                haptics.light();
                play('pop');
              }}
              style={[styles.input, fonts.body, { color: colors.ink }]} />
          </View>
          {goodThings.slice(0, 20).map((g) => (
            <Animated.View key={g.id} entering={FadeIn.duration(duration.fast)} exiting={FadeOut.duration(duration.quick)} layout={LinearTransition} style={styles.goodRow}>
              <Text style={styles.flex}>{g.text}</Text>
              <PressScale accessibilityRole="button" accessibilityLabel={`delete ${g.text}`} hitSlop={10} onPress={() => removeGoodThing(g.id)}>
                <Icon name="trash" size={18} color={colors.ink3} />
              </PressScale>
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  gear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  card: { borderRadius: radius.card, padding: space.l + 2, gap: space.m },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  kicker: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  tile: { flexBasis: '46%', flexGrow: 1, borderRadius: radius.card - 6, padding: space.l, gap: space.s },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heat: { flexDirection: 'row', gap: 3, height: 28 },
  cell: { flex: 1, borderRadius: 4 },
  addRow: { borderRadius: radius.field, paddingHorizontal: space.l },
  input: { minHeight: 44, fontSize: typeScale.body },
  goodRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 36 },
});
