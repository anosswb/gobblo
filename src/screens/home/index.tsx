import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
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
import { levelOf, MAX_LEVEL, STAGES, stageOfLevel } from '@/features/progress/logic';
import { skyOf, StageBackdrop, StageWater, useStageLook, WATER_SHARE } from '@/components/stage-backdrop';
import { LevelUp } from '@/pet/level-up';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { Burst, SparkGain } from '@/pet/burst';
import { Bubbles, Splash, useHappyDive } from '@/pet/dive';
import { feedInfo } from '@/pet/dive-logic';
import { maybeAskRating } from '@/lib/rating';
import { Evolution } from '@/pet/evolution';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { dayKey, type Bite, type Size } from '@/state/schema';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

import { BiteFocusProvider } from './bite-focus';
import { BiteRow } from './bite-row';
import { WeeklyCard } from './weekly-card';
import { DragGuide } from './drag-guide';
import { PetStroke, usePetting, type PetPhase } from './pet-stroke';
import { FeedDragProvider, FloatingFood, useFeedDragState } from './feed-drag';
import { FoodIcon } from '@/components/food-icon';
import { BiteIcon } from '@/components/bite-icon';
import { guessSize } from '@/features/bites/chop';
import { platePreview, plateLimit } from '@/features/bites/plate';
import { laterGroups, timed, type When } from '@/features/bites/when';
import { clockLabel, movedLabel, whenText, WhenPicker } from '@/components/when-picker';
import type { IconName } from '@/components/icon';

const h = en.home;

/** The otter's size as a share of the stage height (its canvas is 1.2× taller than wide). */
const PET_SHARE = 0.6;
/** How far the canvas bottom sinks under the water line, as a share of the canvas height (about half the feet). */
const FEET_SINK = 0.06;
/** After the otter surfaces: the level-up / evolution, the good-things toast and the rating ask wait this long (the moment belongs to the pet). */
const AFTER_SURFACE = { evolve: 1300, goodThing: 1500, rating: 2800 } as const;

/** The face while you pet it: purring, content after, then hopeful when it asks for more. */
const PET_MOOD: Record<PetPhase, Mood | null> = { idle: null, stroke: 'love', content: 'calm', asking: 'hopeful' };

const dateLine = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

/**
 * Home. The pet on a short stage, then the plate right under it, so today's bites show without
 * a scroll (docs/15 item 1). The add field is the first row of the plate.
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
  // the plate is the job: the stage takes about a quarter of the screen so bites show on open
  // (3 bites on a 375×812 phone, 2 on short ones); the otter is the hero inside it
  const stageH = Math.round(Math.min(216, Math.max(172, screenH * 0.26)));
  const [stageW, setStageW] = useState(0);
  const waterH = Math.round(stageH * WATER_SHARE);
  // the otter is ~half the box: its canvas is 1.2× the size and ~70 % of the canvas is otter
  const petSize = Math.round(stageH * PET_SHARE);
  const petH = petSize * 1.2;
  // canvas bottom just under the water line, so the feet sit slightly in the water
  const petBottom = waterH - Math.round(petH * FEET_SINK);
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
  const [plateOpen, setPlateOpen] = useState(false);
  const [selected, setSelected] = useState<Bite | null>(null);
  // widget Start when it cannot start the clock (not onboarded, or a timer already runs): gobblo://start → Home?start=<id>&at=<tap time> opens that
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
  const preview = platePreview(list, { limit: plateLimit(screenH), expanded: plateOpen });
  const shown = settings.oneThingMode ? list.slice(0, 1) : preview.visible;
  const foldedCount = platePreview(list, { limit: plateLimit(screenH), expanded: false }).hiddenCount;
  const canFold = !settings.oneThingMode && foldedCount > 0;
  const look = useLook();
  const stage = look.stage;

  // new food arrived (typed here or served from the brain dump): the pet gets excited
  // a new bite that would land in the folded part opens it, so you see it land
  const seenIds = useRef(new Set(list.map((b) => b.id)));
  useEffect(() => {
    const fresh = list.filter((b) => !seenIds.current.has(b.id));
    seenIds.current = new Set(list.map((b) => b.id));
    if (!fresh.length || plateOpen || settings.oneThingMode) return;
    const vis = new Set(platePreview(list, { limit: plateLimit(screenH), expanded: false }).visible.map((b) => b.id));
    if (fresh.some((b) => !vis.has(b.id))) setPlateOpen(true);
  }, [list, plateOpen, screenH, settings.oneThingMode]);
  const plateBefore = useRef(list.length);
  useEffect(() => {
    if (list.length > plateBefore.current) setReaction('excited');
    plateBefore.current = list.length;
  }, [list.length]);

  // crossing a stage threshold: the evolution scene plays on Home only (never behind Focus),
  // right after the chomp, or when you come back to Home after it happened elsewhere
  // a new level: the level-up card (once per level). A new evolution form plays the big
  // evolution scene first, then the card.
  const [evolveTo, setEvolveTo] = useState<{ stage: number; level: number } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const celebrating = useRef(false);
  useEffect(() => {
    celebrating.current = evolveTo !== null || levelUp !== null;
  }, [evolveTo, levelUp]);
  const evolveIfNew = () => {
    const st = useAppStore.getState();
    const lv = levelOf(st.stats.total);
    const seen = st.stats.seenLevel ?? 1;
    if (lv <= seen) return;
    st.markLevelSeen(lv);
    // exactly one celebration per level: a new form plays the evolution scene (it carries the
    // level's reward); the Legend at level 20 and every other level use the level-up card
    if (stageOfLevel(lv) > stageOfLevel(seen) && lv < MAX_LEVEL) {
      setEvolveTo({ stage: stageOfLevel(lv), level: lv });
    } else {
      setLevelUp(lv);
    }
  };

  // a bite was eaten (focus finished): chomp, then celebrate with a sparkle burst
  const [burst, setBurst] = useState(0);
  const [toTop, setToTop] = useState(0);
  const [askAgain, setAskAgain] = useState(false);
  const [gain, setGain] = useState(0);
  const eatenBefore = useRef(stats.eaten);
  const sparksBefore = useRef(stats.sparks);
  // said "Not now" in onboarding: ask once more, gently, when the app opens on day 3+
  // (never in the same visit as a feed: that moment belongs to the pet)
  const fedThisVisit = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      const st = useAppStore.getState();
      if (!shouldAskNudgeAgain(st.settings, Date.now(), { eaten: st.stats.eaten, fedThisVisit: fedThisVisit.current })) return;
      st.updateSettings({ nudgeAskedAgain: true });
      setAskAgain(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);
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
  // the pet's voice: one line in the bubble (tap, or asking for more after petting)
  const [say, setSay] = useState<string | null>(null);
  // petting: after a stroke it asks once for more ("Again?"), unless Pet talk is off
  const againAt = useRef(0);
  const petting = usePetting({
    reduceMotion,
    onAsk: () => {
      if (useAppStore.getState().settings.petTalk === 'silent') return;
      againAt.current = (againAt.current + 1) % h.again.length;
      setSay(h.again[againAt.current]);
    },
  });
  const { reset: resetPetting } = petting;
  // the happy dive (docs/18 §5): chomp → hop → dive under the water line → bubbles → back up
  // with a splash and the pebble: that is when the "+N ✦" shows. Nothing else pops up meanwhile.
  const after = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => after.current.forEach(clearTimeout), []);
  const dive = useHappyDive({
    depth: Math.round(petH + 24),
    reach: Math.round(Math.min(96, stageW * 0.27)),
    reduceMotion,
    onDive: () => {
      haptics.light();
      play('pop');
    },
    onSurface: (p) => {
      setReaction(reduceMotion ? 'chomp' : 'celebrating');
      setGain(p.total);
      setBurst((b) => b + 1);
      haptics.success();
      play('spark');
      after.current.forEach(clearTimeout);
      after.current = [
        setTimeout(evolveIfNew, AFTER_SURFACE.evolve),
        setTimeout(() => {
          if (useAppStore.getState().settings.goodThingsJar) toast(h.goodThingAsk, { label: en.focus.goodThing, onPress: () => router.push('/me') });
        }, AFTER_SURFACE.goodThing),
        // store rating (rules in features/rating): after the moment is over, never over a celebration
        setTimeout(() => {
          if (!celebrating.current) void maybeAskRating();
        }, AFTER_SURFACE.rating),
      ];
    },
  });
  const { feed: diveFeed, busy: diveBusy } = dive;
  // coming back to Home: celebrate a new level (not while the otter is diving: it does that after it surfaces)
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => {
        if (!diveBusy()) evolveIfNew();
      }, 900);
      return () => clearTimeout(t);
    }, [diveBusy]),
  );
  const totalBefore = useRef(stats.total);
  useEffect(() => {
    if (stats.eaten > eatenBefore.current) {
      // the feeding moment: bring the pet into view and chomp; the dive takes it from there
      const won = stats.sparks - sparksBefore.current;
      fedThisVisit.current = true;
      setAskAgain(false);
      setToTop((n) => n + 1);
      resetPetting();
      setReaction('chomp');
      play('boop');
      diveFeed(feedInfo(won, totalBefore.current, stats.total));
    }
    eatenBefore.current = stats.eaten;
    sparksBefore.current = stats.sparks;
    totalBefore.current = stats.total;
  }, [stats.eaten, stats.sparks, stats.total, diveFeed, resetPetting]);

  const sky = skyOf(openedAt.getHours());
  const stageLook = useStageLook(look.room, sky);
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
  // the pet's voice: one line in the bubble when you tap it (Pet talk off = it stays quiet)
  const lineAt = useRef(openedAt.getDate());
  const speak = () => {
    if (settings.petTalk === 'silent') return;
    lineAt.current = (lineAt.current + 1) % en.petLines.length;
    setSay(en.petLines[lineAt.current]);
  };
  useEffect(() => {
    if (!say) return;
    const t = setTimeout(() => setSay(null), 4500);
    return () => clearTimeout(t);
  }, [say]);
  const bubble = away >= 2 ? h.comeback(away) : say;
  const weeklyDue = recapDue(settings.weekSeen ?? 0, settings.firstOpen, new Date());
  const asleep = sky === 'night' && settings.autoSleep && list.length === 0;
  const autoMood: Mood = asleep ? 'sleepy' : stats.todayEaten >= 4 ? 'love' : stats.todayEaten === 0 && list.length > 0 ? 'hopeful' : 'happy';
  // the face chosen in the Closet wins; 'auto' reacts to the day
  const baseMood: Mood = look.homeMood === 'auto' ? autoMood : look.homeMood;
  const mood: Mood = carrying ? (overPet ? 'chomp' : 'hungry') : (PET_MOOD[petting.phase] ?? reaction ?? baseMood);

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

  // the bite actions, shared by the start sheet, the hold menu (focus mode) and screen readers
  const openStart = (b: Bite) => {
    haptics.select();
    play('pop');
    setSelected(b);
  };
  const doFirst = (b: Bite) => {
    const st = useAppStore.getState();
    st.moveToTop(b.id);
    if (b.when) st.setBiteWhen(b.id, 'today');
    haptics.light();
    toast(en.start.firstDone);
  };
  // "Later" from the hold menu: one tap moves it to Tomorrow; Undo puts the exact bite back
  const moveLater = (b: Bite) => {
    useAppStore.getState().setBiteWhen(b.id, 'tomorrow');
    haptics.light();
    toast(en.when.moved(movedLabel('tomorrow')), { label: h.undo, onPress: () => restoreBite(b) });
  };
  const rowActions = (b: Bite) => ({
    onOpen: () => openStart(b),
    onFirst: () => doFirst(b),
    onLater: b.when ? undefined : () => moveLater(b),
    onRemove: () => removeWithUndo(b.id),
  });

  const enter = (i: number) =>
    reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(staggerDelay(i));

  return (
    <BiteFocusProvider actions={{ onStart: openStart, onFirst: doFirst, onLater: moveLater, onRemove: (b) => removeWithUndo(b.id) }}>
    <Screen
      overlay={<FloatingFood emoji={floatEmoji} x={drag.x} y={drag.y} shown={drag.shown} over={drag.over} />}
      eyebrow={dateLine(openedAt)}
      title={h.today}
      scrollTopKey={toTop}
      right={
        <View style={styles.headRight}>
          <View style={[styles.sparks, { backgroundColor: colors.reward }]} accessibilityLabel={`${stats.sparks} sparks`}>
            <Icon name="sparkle" size={14} weight="bold" color={colors.onReward} />
            <SlidingNumber value={stats.sparks} />
          </View>
          <PressScale accessibilityRole="button" accessibilityLabel={en.tools.open} hitSlop={4} onPress={() => { haptics.select(); router.push('/tools'); }}>
            <Glass interactive radius={22} style={styles.toolBtn}>
              <Icon name="toolkit" size={20} color={colors.ink} />
            </Glass>
          </PressScale>
        </View>
      }>
      {/* hero: the pet on its stage */}
      <View style={[styles.stage, { height: stageH }]} onLayout={(e: LayoutChangeEvent) => setStageW(e.nativeEvent.layout.width)}>
        <StageBackdrop room={look.room} sky={sky} />

        {bubble ? (
          <Animated.View
            key={bubble}
            entering={FadeIn.duration(duration.quick)}
            exiting={FadeOut.duration(duration.quick)}
            style={styles.stageTop}>
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={bubble}
              accessibilityHint={away >= 2 ? en.weekly.away : undefined}
              style={styles.flex}
              onPress={() => {
                if (away >= 2) {
                  haptics.success();
                  play('boop');
                  setReaction('love');
                  sayHi();
                } else {
                  setSay(null);
                }
              }}>
              <Glass radius={18} shadow={false} style={styles.bubble}>
                <Text variant="subhead" numberOfLines={3} style={[styles.chipText, styles.center]}>{bubble}</Text>
              </Glass>
            </PressScale>
          </Animated.View>
        ) : (
          <View style={styles.stageTop}>
            <Glass radius={18} shadow={false} style={styles.chip}>
              <Text variant="caption" style={styles.chipText}>{h.level(look.level, STAGES[stage].name)}</Text>
            </Glass>
            <Glass radius={18} shadow={false} style={styles.chip}>
              <Text variant="caption" style={styles.chipText}>{h.belly(stats.todayEaten)}</Text>
            </Glass>
          </View>
        )}

        <Animated.View pointerEvents="none" style={[styles.feedGlow, { backgroundColor: colors.reward }, glow]} />
        <View style={[styles.pet, { bottom: petBottom }]}>
          <Burst id={burst} />
          {/* the reward starts at the paws (it comes up holding the pebble) */}
          <SparkGain id={burst} amount={gain} top={Math.round(petH * 0.66)} rise={Math.round(petH * 0.75)} />
          {/* the drop zone stays put; only the inner view dives */}
          <Animated.View ref={petTarget}>
          <Animated.View style={dive.style}>
          <Animated.View style={petting.style}>
          <PetStroke petting={petting}>
          <Pet
            size={petSize}
            color={look.color}
            hat={look.hat}
            face={look.face}
            mood={mood}
            stage={stage}
            accessibilityLabel={`${pet.name}, ${h.belly(stats.todayEaten)}`}
            onPress={() => {
              play('boop');
              resetPetting();
              setReaction(asleep ? 'tired' : (['excited', 'love', 'celebrating', 'confident'] as Mood[])[Math.floor(Math.random() * 4)]);
              if (!asleep) speak();
            }}
          />
          </PetStroke>
          </Animated.View>
          </Animated.View>
          </Animated.View>
        </View>
        {/* the otter's home: calm water in front of its feet */}
        <StageWater height={waterH} width={stageW} look={stageLook} />
        <View pointerEvents="none" style={[styles.waterLine, { bottom: waterH }]}>
          {/* the bubbles follow the otter as it swims across under the water */}
          <Animated.View style={[styles.diveTrail, dive.trail]}>
            {dive.under ? <Bubbles color={stageLook.water} crest={stageLook.crest} reduceMotion={reduceMotion} /> : null}
          </Animated.View>
          {/* a splash where it goes in, and another where it comes out */}
          <View style={[styles.diveTrail, { transform: [{ translateX: dive.splashX }] }]}>
            <Splash key={dive.splash} id={dive.splash} color={stageLook.water} crest={stageLook.crest} reduceMotion={reduceMotion} />
          </View>
        </View>
      </View>

      {/* at most one card between the pet and the plate: the nudge ask, or the weekly surprise */}
      {askAgain ? (
        <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)} style={[styles.note, styles.askNote, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
          <View style={styles.askHead}>
            <View style={[styles.noteIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="bell" size={16} color={colors.primaryInk} />
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
      ) : null}

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
                <Icon name="calendar" size={14} color={newWhen !== 'today' || newMinutes !== null ? colors.primaryInk : colors.ink2} />
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
                <BiteRow bite={b} {...rowActions(b)} />
              </Animated.View>
            ))
          )}
        </View>
        {canFold ? (
          <PressScale
            accessibilityRole="button"
            accessibilityState={{ expanded: plateOpen }}
            accessibilityLabel={plateOpen ? h.showLess : h.showMore(foldedCount)}
            onPress={() => {
              setPlateOpen((v) => !v);
              haptics.light();
            }}
            style={[styles.plateMore, { backgroundColor: colors.fill }]}>
            <Text variant="bodyBold" tone="ink2">{plateOpen ? h.showLess : h.showMore(foldedCount)}</Text>
            <Icon name={plateOpen ? 'chevronUp' : 'chevronDown'} size={13} weight="bold" color={colors.ink3} />
          </PressScale>
        ) : null}

        {settings.oneThingMode && list.length > 1 ? (
          <Text variant="caption" tone="ink2" style={styles.footer}>{h.oneThingMore(list.length - 1)}</Text>
        ) : null}

        {list.length > 1 && !settings.oneThingMode ? (
          <PressScale
            accessibilityRole="button"
            accessibilityLabel={h.pick}
            accessibilityHint={h.pickHint}
            onPress={() => {
              haptics.select();
              router.push('/tools/pick');
            }}
            style={[styles.pick, { backgroundColor: colors.fill }]}>
            <Icon name="spin" size={16} color={colors.ink} />
            <Text variant="bodyBold">{h.pick}</Text>
          </PressScale>
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
                        <BiteRow key={b.id} bite={b} tag={whenText(g.when, g.day)} {...rowActions(b)} />
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
        stage={evolveTo?.stage ?? null}
        level={evolveTo?.level ?? 1}
        onDone={() => setEvolveTo(null)}
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
          setSelected(null);
          doFirst(selected);
        }}
        onSplit={() => {
          if (!selected) return;
          const id = selected.id;
          setSelected(null);
          router.push({ pathname: '/dump', params: { split: id } });
        }}
        onAlready={() => {
          if (!selected) return;
          useAppStore.getState().feedDone(selected.id);
          setSelected(null);
          // a light tap now; the success tap and the spark sound come when the otter surfaces
          haptics.light();
        }}
        onStart={(minutes, mode) => {
          if (!selected) return;
          startFocus({ id: selected.id, text: selected.text, size: selected.size }, minutes, mode);
          setSelected(null);
          haptics.medium();
          play('spark');
          router.push('/focus');
        }}
      />
    </Screen>
    </BiteFocusProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  toolBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  sparks: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.m, height: 32, borderRadius: radius.chip, marginBottom: space.xs },
  stage: { borderRadius: radius.scene, overflow: 'hidden' },
  // absolute: the bubble must never push or scroll what is inside the clipped stage
  stageTop: { position: 'absolute', top: 0, start: 0, end: 0, flexDirection: 'row', justifyContent: 'space-between', padding: space.m, gap: space.s, zIndex: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.m, height: 32 },
  chipText: { fontWeight: '600' },
  bubble: { paddingHorizontal: space.l, paddingVertical: space.s, minHeight: 32, justifyContent: 'center' },
  pet: { position: 'absolute', start: 0, end: 0, alignItems: 'center' },
  waterLine: { position: 'absolute', start: 0, end: 0, height: 0 },
  diveTrail: { position: 'absolute', start: 0, end: 0, top: 0, height: 0 },
  note: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderRadius: radius.card - 6, padding: space.l },
  askNote: { flexDirection: 'column', alignItems: 'stretch' },
  askHead: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  askRow: { flexDirection: 'row', gap: space.s },
  askBtn: { flex: 1, minHeight: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  noteIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: { gap: space.m },
  list: { borderRadius: radius.card, overflow: 'hidden' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.m, minHeight: 64 },
  input: { flex: 1, minHeight: 44, fontSize: typeScale.body },
  addChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, paddingHorizontal: space.m, paddingBottom: space.m, marginTop: -space.xs },
  addChip: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 32, paddingHorizontal: space.m, borderRadius: radius.chip },
  whenPanel: { width: '100%', paddingTop: space.s },
  laterWrap: { gap: space.s, marginTop: space.s },
  laterHead: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, paddingHorizontal: space.l, borderRadius: radius.card - 6, borderWidth: StyleSheet.hairlineWidth },
  plateMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s, minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.card - 6, marginTop: space.s },
  laterBody: { gap: space.m },
  laterGroup: { gap: space.xs },
  addBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  food: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.s, padding: space.xl, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { marginTop: space.s, minHeight: 44, paddingHorizontal: space.xl, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: space.l },
  pick: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.chip },
  feedGlow: { position: 'absolute', bottom: -60, alignSelf: 'center', width: 260, height: 260, borderRadius: 130 },
  noOutline: Platform.select({ web: { outlineStyle: 'none' }, default: {} }) as object,
});
