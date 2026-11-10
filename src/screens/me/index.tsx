import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { COLORS, FACES, HATS, ROOMS } from '@/features/closet/items';
import { MAX_LEVEL, STAGES, levelProgress, weekBuckets, weekMeter } from '@/features/progress/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

import { BrainCard } from './brain-card';
import { LevelRing } from './level-ring';
import { RoadTo20 } from './road';
import { WeekChart } from './week-chart';

/**
 * Me = personal progress dashboard (docs/12 #4, #11): all data on the phone, no analytics SDK.
 * Level card, road to 20, one plain "so far" sentence, the week chart (a meter that never
 * "breaks"), the shareable brain card once it means something (10 bites) and the good things jar.
 */
const BRAIN_AT = 10;

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

  const look = useLook();
  const lp = levelProgress(stats.total);
  const nextReward = lp.toNext === null ? null : [...HATS, ...FACES, ...COLORS, ...ROOMS].find((i) => i.unlock.type === 'level' && i.unlock.level === lp.level + 1);
  const days = weekBuckets(sessions, openedAt, settings.weekStartsMonday);
  const meter = weekMeter(days);

  return (
    <Screen
      title={en.me.title(pet.name)}
      right={
        <View style={styles.headRight}>
        <PressScale accessibilityRole="button" accessibilityLabel={en.me.settings} hitSlop={4} onPress={() => router.push('/settings')}>
          <Glass interactive radius={22} style={styles.gear}>
            <Icon name="gear" size={20} color={colors.ink} />
          </Glass>
        </PressScale>
        </View>
      }>
      <View style={[styles.card, styles.levelCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <LevelRing progress={lp.progress} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={lp.toNext === null ? 'confident' : 'proud'} />
        <View style={styles.flex}>
          <Text variant="caption" tone="primary" style={styles.kicker}>{en.me.level(lp.level, MAX_LEVEL)}</Text>
          <Text variant="title2">{STAGES[look.stage].name}</Text>
          <Text variant="subhead" tone="ink2">{lp.toNext === null ? en.me.legend : en.me.toLevel(lp.toNext, lp.level + 1)}</Text>
          {nextReward ? <Text variant="caption" tone="ink2">{en.me.nextReward(nextReward.name)}</Text> : null}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.rowBetween}>
          <Text variant="heading" style={styles.flexOne}>{en.me.road.title}</Text>
          <Text variant="bodyBold" tone="primary">{en.me.road.count(lp.level, MAX_LEVEL)}</Text>
        </View>
        <RoadTo20 level={lp.level} total={stats.total} color={look.color} />
      </View>

      {stats.eaten >= 1 ? (
        <Text variant="body" tone="ink2" style={styles.note}>{en.me.sofar(stats.eaten, stats.minutes)}</Text>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.rowBetween}>
          <Text variant="heading">{en.me.week.title}</Text>
          {/* a count, not a score out of 10 (panel: "0/10" on a Monday read like failing) */}
          <Text variant="bodyBold" tone="primary">{en.me.week.bites(meter.bites)}</Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.fill }]}>
          <View style={[styles.fill, { width: `${Math.max(4, meter.progress * 100)}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text variant="subhead" tone="ink2">
          {meter.daysFed === 0 ? en.me.week.fresh : en.me.week.showedUp(meter.daysFed)}
        </Text>
        <Segmented accessibilityLabel={en.me.week.chartShows} value={metric} onChange={setMetric}
          options={[{ value: 'bites', label: en.me.week.metricBites }, { value: 'minutes', label: en.me.week.metricMinutes }]} />
        <WeekChart days={days} metric={metric} />
      </View>

      {stats.eaten >= BRAIN_AT ? (
        <BrainCard />
      ) : (
        <Text variant="subhead" tone="ink2" style={styles.note}>{en.me.brain.locked(BRAIN_AT - stats.eaten)}</Text>
      )}

      {(settings.goodThingsJar || goodThings.length > 0) && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
          <Text variant="heading">{en.me.jar.title}</Text>
          <Text variant="caption" tone="ink2">{en.me.jar.hint}</Text>
          <View style={[styles.addRow, { backgroundColor: colors.fill }]}>
            <TextInput value={good} onChangeText={setGood} placeholder={en.me.jar.placeholder} placeholderTextColor={colors.ink3}
              maxLength={120} returnKeyType="done" accessibilityLabel={en.me.jar.add}
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
              <PressScale accessibilityRole="button" accessibilityLabel={en.me.jar.remove(g.text)} hitSlop={10} onPress={() => removeGoodThing(g.id)}>
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
  flexOne: { flex: 1 },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  flex: { flex: 1, gap: 2 },
  gear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  card: { borderRadius: radius.card, padding: space.l + 2, gap: space.m },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  kicker: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  note: { paddingHorizontal: space.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.s },
  addRow: { borderRadius: radius.field, paddingHorizontal: space.l },
  input: { minHeight: 44, fontSize: typeScale.body },
  goodRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 36 },
});
