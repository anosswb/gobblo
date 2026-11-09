import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { GuideHelp } from '@/components/guide/page-guide';
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
import { recapDue } from '@/features/weekly/logic';
import { useLook } from '@/features/closet/use-look';
import { shouldAskNudgeAgain } from '@/features/nudges/ask-again';
import { askNotificationPermission } from '@/features/nudges/schedule';
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
import { dayKey, type Bite, type Size } from '@/state/schema';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

import { BiteRow } from './bite-row';
import { WeeklyCard } from './weekly-card';
import { DragGuide } from './drag-guide';
import { FeedDragProvider, FloatingFood, useFeedDragState } from './feed-drag';
import { FoodIcon } from '@/components/food-icon';
import { BiteIcon } from '@/components/bite-icon';
import { guessSize } from '@/features/bites/chop';
import { laterGroups, timed, type When } from '@/features/bites/when';
import { clockLabel, movedLabel, whenText, WhenPicker } from '@/components/when-picker';
import type { IconName } from '@/components/icon';

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
  // the size is guessed live from the words ("write the report" → Big); a tap on the size chip overrides it
  const [manualSize, setManualSize] = useState<Size | null>(null);
  const typing = text.trim().length > 0;
  const size: Size = manualSize ?? (typing ? guessSize(text) : 1);
  // "when" for the new bite (panel #1 ask): Today by default, optional time
  const [newWhen, setNewWhen] = useState<When>('today');
  const [newDay, setNewDay] = useState<string | undefined>(undefined);
  const [newMinutes, setNewMinutes] = useState<number | null>(null);
  const [whenOpen, setWhenOpen] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const [selected, setSelected] = useState<Bite | null>(null);
  // widget Start without Start Kit: gobblo://start → Home?start=<id>&at=<tap time> opens that
  // bite's start sheet once per tap (the param is left in place: clearing it hid the sheet)
  const { start: startParam, at: startAt } = useLocalSearchParams<{ start?: string; at?: string }>();
  const handledStart = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!startParam || handledStart.current === startAt) return;
    handledStart.current = startAt;
    const id = setTimeout(() => {
      const b = plate(useAppStore.getState().bites).find((x) => x.id === startParam);
      if (b) setSelected(b);
    }, 250);
    return () => clearTimeout(id);
  }, [startParam, startAt]);
  const [reaction, setReaction] = useState<Mood | null>(null);

  // drag-to-feed
  const drag = useFeedDragState();
  const petTarget = useAnimatedRef<Animated.View>();
  const [carrying, setCarrying] = useState(false);
  const [overPet, setOverPet] = useState(false);
  const [floatEmoji, setFloatEmoji] = useState<IconName>('foodSmall');
  const glow = useAnimatedStyle(() => ({ opacity: drag.shown.get() * (0.35 + 0.65 * drag.over.get()), transform: [{ scale: 0.9 + 0.15 * drag.over.get() }] }));

  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setReaction(null), reaction === 'chomp' ? 900 : 1400);
    return () => clearTimeout(t);
  }, [reaction]);

  const today = dayKey(openedAt);
  const list = plate(bites, today);
  const later = laterGroups(bites, today);
  const laterCount = later.reduce((n, g) => n + g.bites.length, 0);
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
  const [askAgain, setAskAgain] = useState(false);
  const eatenBefore = useRef(stats.eaten);
  // said "Not now" in onboarding: ask once more, gently, right after a bite on day 3+
  const maybeAskAgain = () => {
    const st = useAppStore.getState();
    if (!shouldAskNudgeAgain(st.settings)) return;
    st.updateSettings({ nudgeAskedAgain: true });
    setAskAgain(true);
  };
  const answerAskAgain = async (yes: boolean) => {
    setAskAgain(false);
    haptics.light();
    if (!yes) {
      toast(h.askAgainLater);
      return;
    }
    const ok = await askNotificationPermission().catch(() => false);
    if (ok) useAppStore.getState().updateSettings({ nudge: 'gentle' });
    toast(ok ? h.askAgainOn : h.askAgainLater);
  };
  useEffect(() => {
    if (stats.eaten > eatenBefore.current) {
      setReaction('chomp');
      const t = setTimeout(() => {
        setReaction('celebrating');
        setBurst((b) => b + 1);
        haptics.success();
      }, 700);
      const t2 = setTimeout(evolveIfNew, 1700);
      const t3 = setTimeout(maybeAskAgain, 2400);
      eatenBefore.current = stats.eaten;
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    eatenBefore.current = stats.eaten;
  }, [stats.eaten]);

  const sky = skyOf(openedAt.getHours());
  // welcome back after 2+ days away: newDayCheck keeps the gap until you say hi (or feed)
  const away = stats.lastVisit === dayKey() ? (stats.awayDays ?? 0) : daysAway(stats.lastVisit, new Date());
  const sayHi = () => {
    const st = useAppStore.getState();
    useAppStore.setState({ stats: { ...st.stats, awayDays: 0 } });
  };
  // the pet lights up once when you come back (no sound until you tap: it may be a quiet moment)
  const welcomed = useRef(false);
  useEffect(() => {
    if (away < 2 || welcomed.current) return;
    welcomed.current = true;
    const t = setTimeout(() => setReaction('love'), 500);
    return () => clearTimeout(t);
  }, [away]);
  const weeklyDue = recapDue(settings.weekSeen ?? 0, settings.firstOpen, new Date());
  const wisdom = en.wisdom[dayIndex(openedAt) % en.wisdom.length];
  const mindful = en.mindful[dayIndex(openedAt) % en.mindful.length];
  const belly = Math.min(1, stats.todayEaten / 4);
  const asleep = sky === 'night' && settings.autoSleep && list.length === 0;
  const autoMood: Mood = asleep ? 'sleepy' : stats.todayEaten >= 4 ? 'love' : stats.todayEaten === 0 && list.length > 0 ? 'curious' : 'happy';
  // the face chosen in the Closet wins; 'auto' reacts to the day
  const baseMood: Mood = look.homeMood === 'auto' ? autoMood : look.homeMood;
  const mood: Mood = carrying ? (overPet ? 'chomp' : 'hungry') : (reaction ?? baseMood);

  const add = () => {
    if (!text.trim()) {
      haptics.warning();
      play('nope');
      return;
    }
    const [id] = addBites([{ text, size }]);
    const st = useAppStore.getState();
    if (id && newWhen !== 'today') st.setBiteWhen(id, newWhen, newDay);
    if (id && newMinutes !== null && timed(newWhen)) st.setBiteTime(id, newMinutes);
    if (newWhen !== 'today') toast(en.when.moved(movedLabel(newWhen, newDay)));
    setText('');
    setManualSize(null);
    setNewWhen('today');
    setNewDay(undefined);
    setNewMinutes(null);
    setWhenOpen(false);
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
        <View style={styles.headRight}>
          <View style={[styles.sparks, { backgroundColor: colors.reward }]} accessibilityLabel={`${stats.sparks} sparks`}>
            <Icon name="sparkle" size={14} weight="bold" color={colors.onReward} />
            <SlidingNumber value={stats.sparks} />
          </View>
          <GuideHelp id="home" />
          {/* Toolkit (breathe, calm down, unstick, sit with me, reminders, daily tip) */}
          <PressScale accessibilityRole="button" accessibilityLabel={en.tools.open} hitSlop={4} onPress={() => { haptics.select(); router.push('/tools'); }}>
            <Glass interactive radius={22} style={styles.toolBtn}>
              <Icon name="toolkit" size={20} color={colors.ink} />
            </Glass>
          </PressScale>
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
          <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)} exiting={FadeOut.duration(duration.quick)} style={styles.bubbleWrap}>
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={h.comeback(away)}
              accessibilityHint={en.weekly.away}
              onPress={() => {
                haptics.success();
                play('boop');
                setReaction('love');
                sayHi();
              }}>
              <Glass radius={20} style={styles.bubble}>
                <Text variant="subhead" style={styles.chipText}>{h.comeback(away)}</Text>
              </Glass>
            </PressScale>
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

      {/* one line of pet wisdom (or, once, the gentle "can I nudge you?" ask) */}
      {askAgain ? (
        <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)} style={[styles.note, styles.askNote, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
          <View style={styles.askHead}>
            <View style={[styles.noteIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="bell" size={16} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyBold">{h.askAgainTitle(pet.name)}</Text>
              <Text variant="caption" tone="ink2">{h.askAgainSub}</Text>
            </View>
          </View>
          <View style={styles.askRow}>
            <PressScale accessibilityRole="button" onPress={() => void answerAskAgain(false)} style={[styles.askBtn, { backgroundColor: colors.fill }]}>
              <Text variant="bodyBold">{h.askAgainNo}</Text>
            </PressScale>
            <PressScale accessibilityRole="button" onPress={() => void answerAskAgain(true)} style={[styles.askBtn, { backgroundColor: colors.primary }]}>
              <Text variant="bodyBold" tone="onPrimary">{h.askAgainYes}</Text>
            </PressScale>
          </View>
        </Animated.View>
      ) : weeklyDue ? (
        <WeeklyCard now={new Date()} />
      ) : (
      <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={[styles.noteIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name="sparkle" size={16} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text variant="caption" tone="ink2">{settings.mindfulNote ? h.mindfulTitle : h.wisdomTitle}</Text>
          <Text variant="body">{settings.mindfulNote ? mindful : wisdom}</Text>
        </View>
      </View>
      )}

      {/* the plate */}
      <FeedDragProvider
        value={{
          target: petTarget,
          ...drag,
          onStart: (_id, emoji) => {
            setFloatEmoji(emoji);
            setCarrying(true);
            if (!useAppStore.getState().settings.tipDragSeen) useAppStore.getState().updateSettings({ tipDragSeen: true });
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
          {list.length > 0 && !settings.tipDragSeen ? null : <Text variant="caption" tone="ink2">{h.hint(pet.name)}</Text>}
        </View>

        {list.length > 0 && !settings.tipDragSeen ? (
          <DragGuide
            petName={pet.name}
            color={look.color}
            stage={look.stage}
            hat={look.hat}
            face={look.face}
            onDone={() => {
              haptics.light();
              useAppStore.getState().updateSettings({ tipDragSeen: true });
            }}
          />
        ) : null}

        <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
          <View style={styles.addRow}>
            <View style={[styles.food, { backgroundColor: colors.fill }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {typing ? <BiteIcon text={text} size={size} /> : <FoodIcon size={size} color={colors.ink3} />}
            </View>
            <TextInput
              value={text}
              onChangeText={(v) => {
                setText(v);
                if (!v.trim()) setManualSize(null);
              }}
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
              style={[styles.addBtn, { backgroundColor: typing ? colors.primary : colors.fill }]}>
              <Icon name="plus" size={18} weight="bold" color={typing ? colors.onPrimary : colors.ink3} />
            </PressScale>
          </View>
          {typing ? (
            <Animated.View entering={FadeIn.duration(duration.quick)} style={styles.addChips}>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={`${h.sizeLabel}: ${FOOD[size].label}, ${FOOD[size].min} min`}
                hitSlop={8}
                onPress={() => {
                  setManualSize(((size + 1) % 4) as Size);
                  haptics.select();
                  play('tick');
                }}
                style={[styles.addChip, { backgroundColor: colors.fill }]}>
                <FoodIcon size={size} px={14} color={colors.ink2} />
                <Text variant="caption" tone="ink2" style={styles.chipText}>{h.sizeChip(FOOD[size].label, FOOD[size].min)}</Text>
              </PressScale>
              <PressScale
                accessibilityRole="button"
                accessibilityState={{ expanded: whenOpen }}
                accessibilityLabel={`${en.when.title}: ${whenText(newWhen, newDay)}`}
                hitSlop={8}
                onPress={() => {
                  setWhenOpen((v) => !v);
                  haptics.select();
                }}
                style={[styles.addChip, { backgroundColor: newWhen !== 'today' || newMinutes !== null ? colors.primarySoft : colors.fill }]}>
                <Icon name="calendar" size={14} color={newWhen !== 'today' || newMinutes !== null ? colors.primary : colors.ink2} />
                <Text variant="caption" tone={newWhen !== 'today' || newMinutes !== null ? 'primary' : 'ink2'} style={styles.chipText}>
                  {en.when.chip(whenText(newWhen, newDay), newMinutes !== null && timed(newWhen) ? clockLabel(newMinutes, settings.clock24h) : undefined)}
                </Text>
              </PressScale>
              {whenOpen ? (
                <Animated.View entering={FadeIn.duration(duration.quick)} style={styles.whenPanel}>
                  <WhenPicker
                    when={newWhen}
                    day={newDay}
                    minutes={newMinutes}
                    onWhen={(w, d) => {
                      setNewWhen(w);
                      setNewDay(d);
                    }}
                    onTime={setNewMinutes}
                  />
                </Animated.View>
              ) : null}
            </Animated.View>
          ) : null}

          {list.length === 0 ? (
            <View style={[styles.empty, { borderTopColor: colors.line }]}>
              <Text variant="bodyBold" style={styles.center}>{h.emptyTitle(pet.name)}</Text>
              <Text variant="subhead" tone="ink2" style={styles.center}>{laterCount ? en.when.emptyLater(laterCount) : h.emptySub}</Text>
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

        {/* Later: Tomorrow / This week / Someday, folded away so today's plate stays small */}
        {laterCount > 0 && !settings.oneThingMode ? (
          <View style={styles.laterWrap}>
            <PressScale
              accessibilityRole="button"
              accessibilityState={{ expanded: laterOpen }}
              accessibilityLabel={en.when.laterCount(laterCount)}
              onPress={() => {
                setLaterOpen((v) => !v);
                haptics.select();
              }}
              style={[styles.laterHead, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Icon name="calendar" size={16} color={colors.ink2} />
              <Text variant="bodyBold" style={styles.flex}>{en.when.laterCount(laterCount)}</Text>
              <Icon name={laterOpen ? 'chevronUp' : 'chevronDown'} size={13} weight="bold" color={colors.ink3} />
            </PressScale>
            {laterOpen ? (
              <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)} style={styles.laterBody}>
                <Text variant="caption" tone="ink2" style={styles.footer}>{en.when.laterHint}</Text>
                {later.map((g) => (
                  <View key={g.day ?? g.when} style={styles.laterGroup}>
                    <Text variant="caption" tone="ink2" style={[styles.footer, styles.chipText]}>{whenText(g.when, g.day)}</Text>
                    <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
                      {g.bites.map((b) => (
                        <BiteRow
                          key={b.id}
                          bite={b}
                          tag={whenText(g.when, g.day)}
                          onOpen={() => {
                            haptics.select();
                            setSelected(b);
                          }}
                          onRemove={() => removeWithUndo(b.id)}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </Animated.View>
            ) : null}
          </View>
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
        clock24h={settings.clock24h}
        onWhen={(w, d) => {
          if (!selected) return;
          const st = useAppStore.getState();
          st.setBiteWhen(selected.id, w, d);
          setSelected(st.bites.find((b) => b.id === selected.id) ?? null);
          haptics.select();
        }}
        onTime={(m) => {
          if (!selected) return;
          const st = useAppStore.getState();
          st.setBiteTime(selected.id, m);
          setSelected(useAppStore.getState().bites.find((b) => b.id === selected.id) ?? null);
        }}
        onFirst={() => {
          if (!selected) return;
          useAppStore.getState().moveToTop(selected.id);
          if (selected.when) useAppStore.getState().setBiteWhen(selected.id, 'today');
          setSelected(null);
          haptics.light();
          toast(en.start.firstDone);
        }}
        onSplit={() => {
          if (!selected) return;
          const id = selected.id;
          setSelected(null);
          router.push({ pathname: '/dump', params: { split: id } });
        }}
        onAlready={() => {
          if (!selected) return;
          const r = useAppStore.getState().feedDone(selected.id);
          setSelected(null);
          haptics.success();
          play('spark');
          if (r) toast(en.start.alreadyDone(r.sparks));
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
  headRight: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  toolBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
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
  askNote: { flexDirection: 'column', alignItems: 'stretch' },
  askHead: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  askRow: { flexDirection: 'row', gap: space.s },
  askBtn: { flex: 1, minHeight: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  noteIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: { gap: space.m },
  sectionHead: { gap: 2, paddingHorizontal: space.xs },
  list: { borderRadius: radius.card, overflow: 'hidden' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.m, minHeight: 64 },
  input: { flex: 1, minHeight: 44, fontSize: typeScale.body },
  addChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, paddingHorizontal: space.m, paddingBottom: space.m, marginTop: -space.xs },
  addChip: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 32, paddingHorizontal: space.m, borderRadius: radius.chip },
  whenPanel: { width: '100%', paddingTop: space.s },
  laterWrap: { gap: space.s, marginTop: space.s },
  laterHead: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, paddingHorizontal: space.l, borderRadius: radius.card - 6, borderWidth: StyleSheet.hairlineWidth },
  laterBody: { gap: space.m },
  laterGroup: { gap: space.xs },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  food: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 22, lineHeight: 28 },
  empty: { alignItems: 'center', gap: space.s, padding: space.xl, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { marginTop: space.s, minHeight: 44, paddingHorizontal: space.xl, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: space.l },
  feedGlow: { position: 'absolute', bottom: -60, alignSelf: 'center', width: 260, height: 260, borderRadius: 130 },
  noOutline: Platform.select({ web: { outlineStyle: 'none' }, default: {} }) as object,
});
