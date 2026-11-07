import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';

import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { SlidingNumber } from '@/components/sliding-number';
import { StartSheet } from '@/components/start-sheet';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { daysAway, FOOD, plate } from '@/features/bites/logic';
import { useLook } from '@/features/closet/use-look';
import { levelOf, STAGES, stageOfLevel } from '@/features/progress/logic';
import { skyOf, StageBackdrop } from '@/components/stage-backdrop';
import { LevelUp } from '@/pet/level-up';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { Burst } from '@/pet/burst';
import { Evolution } from '@/pet/evolution';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { todayKey, type Bite, type Size } from '@/state/schema';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

import { BiteRow } from './bite-row';
import { FeedDragProvider, FloatingFood, useFeedDragState } from './feed-drag';

const h = en.home;

const dayIndex = (d: Date) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
const dateLine = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

/**
 * Home. One hero (the pet on its time-of-day stage, glass chips for level and belly), then the
 * plate as an iOS inset-grouped list, Reminders-style: the add field is the first row.
 */
export function HomeScreen() {
  const { colors, reduceMotion } = useTheme();
  const bites = useAppStore((s) => s.bites);
  const pet = useAppStore((s) => s.pet);
  const stats = useAppStore((s) => s.stats);
  const settings = useAppStore((s) => s.settings);
  const addBites = useAppStore((s) => s.addBites);
  const removeBite = useAppStore((s) => s.removeBite);
  const restoreBite = useAppStore((s) => s.restoreBite);
  const toggleDaily = useAppStore((s) => s.toggleDaily);
  const startFocus = useAppStore((s) => s.startFocus);

  const { height: screenH } = useWindowDimensions();
  // the stage shares the first screen with the plate: ~38 % of the height, 240–330 pt
  const stageH = Math.round(Math.min(330, Math.max(240, screenH * 0.38)));
  const [openedAt] = useState(() => new Date());
  const [text, setText] = useState('');
  const [size, setSize] = useState<Size>(1);
  const [selected, setSelected] = useState<Bite | null>(null);
  const [reaction, setReaction] = useState<Mood | null>(null);

  // drag-to-feed
  const drag = useFeedDragState();
  const petTarget = useAnimatedRef<Animated.View>();
  const [carrying, setCarrying] = useState(false);
  const [overPet, setOverPet] = useState(false);
  const [floatEmoji, setFloatEmoji] = useState('🍪');
  const glow = useAnimatedStyle(() => ({ opacity: drag.shown.get() * (0.35 + 0.65 * drag.over.get()), transform: [{ scale: 0.9 + 0.15 * drag.over.get() }] }));

  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setReaction(null), reaction === 'chomp' ? 900 : 1400);
    return () => clearTimeout(t);
  }, [reaction]);

  const today = todayKey(openedAt);
  const list = plate(bites, today);
  const shown = settings.oneThingMode ? list.slice(0, 1) : list;
  const look = useLook();
  const stage = look.stage;

  // new food arrived (typed here or served from the brain dump): the pet gets excited
  const plateBefore = useRef(list.length);
  useEffect(() => {
    if (list.length > plateBefore.current) setReaction('excited');
    plateBefore.current = list.length;
  }, [list.length]);

  // crossing a stage threshold: the evolution scene plays on Home only (never behind Focus),
  // right after the chomp, or when you come back to Home after it happened elsewhere
  // a new level: the level-up card (once per level). A new evolution form plays the big
  // evolution scene first, then the card.
  const [evolveTo, setEvolveTo] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const pendingLevel = useRef<number | null>(null);
  const evolveIfNew = () => {
    const st = useAppStore.getState();
    const lv = levelOf(st.stats.total);
    const seen = st.stats.seenLevel ?? 1;
    if (lv <= seen) return;
    st.markLevelSeen(lv);
    if (stageOfLevel(lv) > stageOfLevel(seen)) {
      pendingLevel.current = lv;
      setEvolveTo(stageOfLevel(lv));
    } else {
      setLevelUp(lv);
    }
  };
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(evolveIfNew, 900);
      return () => clearTimeout(t);
    }, []),
  );

  // a bite was eaten (focus finished): chomp, then celebrate with a sparkle burst
  const [burst, setBurst] = useState(0);
  const eatenBefore = useRef(stats.eaten);
  useEffect(() => {
    if (stats.eaten > eatenBefore.current) {
      setReaction('chomp');
      const t = setTimeout(() => {
        setReaction('celebrating');
        setBurst((b) => b + 1);
        haptics.success();
      }, 700);
      const t2 = setTimeout(evolveIfNew, 1700);
      eatenBefore.current = stats.eaten;
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
    eatenBefore.current = stats.eaten;
  }, [stats.eaten]);

  const sky = skyOf(openedAt.getHours());
  const away = daysAway(stats.lastVisit, openedAt);
  const wisdom = en.wisdom[dayIndex(openedAt) % en.wisdom.length];
  const mindful = en.mindful[dayIndex(openedAt) % en.mindful.length];
  const belly = Math.min(1, stats.todayEaten / 4);
  const asleep = sky === 'night' && settings.autoSleep && list.length === 0;
  const autoMood: Mood = asleep ? 'sleepy' : stats.todayEaten >= 4 ? 'love' : stats.todayEaten === 0 && list.length > 0 ? 'hungry' : 'happy';
  // the face chosen in the Closet wins; 'auto' reacts to the day
  const baseMood: Mood = look.homeMood === 'auto' ? autoMood : look.homeMood;
  const mood: Mood = carrying ? (overPet ? 'chomp' : 'hungry') : (reaction ?? baseMood);

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

  const removeWithUndo = (id: string) => {
    const removed = removeBite(id);
    haptics.light();
    if (removed) toast(h.removed, { label: h.undo, onPress: () => restoreBite(removed) });
  };

  const enter = (i: number) =>
    reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(staggerDelay(i));

  return (
    <Screen
      overlay={<FloatingFood emoji={floatEmoji} x={drag.x} y={drag.y} shown={drag.shown} over={drag.over} />}
      eyebrow={dateLine(openedAt)}
      title={h.greeting(openedAt.getHours())}
      right={
        <View style={[styles.sparks, { backgroundColor: colors.reward }]} accessibilityLabel={`${stats.sparks} sparks`}>
          <Icon name="sparkle" size={14} weight="bold" color={colors.onReward} />
          <SlidingNumber value={stats.sparks} />
        </View>
      }>
      {/* hero: the pet on its stage */}
      <View style={[styles.stage, { height: stageH }]}>
        <StageBackdrop room={look.room} sky={sky} />

        <View style={styles.stageTop}>
          <Glass radius={18} shadow={false} style={styles.chip}>
            <Text variant="caption" style={styles.chipText}>{h.level(look.level, STAGES[stage].name)}</Text>
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

        <Animated.View pointerEvents="none" style={[styles.feedGlow, { backgroundColor: colors.reward }, glow]} />
        <View style={styles.pet}>
          <Burst id={burst} />
          <Animated.View ref={petTarget}>
          <Pet
            size={stageH < 290 ? 104 : 128}
            color={look.color}
            hat={look.hat}
            face={look.face}
            mood={mood}
            stage={stage}
            accessibilityLabel={`${pet.name}, ${h.belly(stats.todayEaten)}`}
            onPress={() => {
              play('boop');
              setReaction(asleep ? 'tired' : (['excited', 'love', 'celebrating', 'confident'] as Mood[])[Math.floor(Math.random() * 4)]);
            }}
          />
          </Animated.View>
        </View>
      </View>

      {/* one line of pet wisdom */}
      <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={[styles.noteIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name="sparkle" size={16} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text variant="caption" tone="ink2">{settings.mindfulNote ? h.mindfulTitle : h.wisdomTitle}</Text>
          <Text variant="body">{settings.mindfulNote ? mindful : wisdom}</Text>
        </View>
      </View>

      {/* the plate */}
      <FeedDragProvider
        value={{
          target: petTarget,
          ...drag,
          onStart: (_id, emoji) => {
            setFloatEmoji(emoji);
            setCarrying(true);
            haptics.light();
            play('pop');
          },
          onOver: (v) => {
            setOverPet(v);
            if (v) haptics.select();
          },
          onDrop: (id) => {
            const b = bites.find((x) => x.id === id);
            haptics.medium();
            play('boop');
            if (b) setSelected(b);
          },
          onEnd: () => {
            setCarrying(false);
            setOverPet(false);
          },
        }}>
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="title2" accessibilityRole="header">{h.bites}</Text>
          <Text variant="caption" tone="ink2">{h.hint(pet.name)}</Text>
        </View>

        <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
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
              style={[styles.input, fonts.body, styles.noOutline, { color: colors.ink }]}
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
                <BiteRow
                  bite={b}
                  onOpen={() => {
                    haptics.select();
                    play('pop');
                    setSelected(b);
                  }}
                  onRemove={() => removeWithUndo(b.id)}
                />
              </Animated.View>
            ))
          )}
        </View>
        {settings.oneThingMode && list.length > 1 ? (
          <Text variant="caption" tone="ink2" style={styles.footer}>{h.oneThingMore(list.length - 1)}</Text>
        ) : null}
      </View>

      </FeedDragProvider>

      <Evolution
        stage={evolveTo}
        onDone={() => {
          setEvolveTo(null);
          if (pendingLevel.current) setLevelUp(pendingLevel.current);
          pendingLevel.current = null;
        }}
      />
      <LevelUp level={levelUp} onDone={() => setLevelUp(null)} />

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
          setSelected(null);
          removeWithUndo(selected.id);
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
  stage: { borderRadius: radius.scene, overflow: 'hidden' },
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
  empty: { alignItems: 'center', gap: space.s, padding: space.xl, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { marginTop: space.s, minHeight: 44, paddingHorizontal: space.xl, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: space.l },
  feedGlow: { position: 'absolute', bottom: -60, alignSelf: 'center', width: 260, height: 260, borderRadius: 130 },
  noOutline: Platform.select({ web: { outlineStyle: 'none' }, default: {} }) as object,
});
