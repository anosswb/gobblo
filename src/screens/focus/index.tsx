import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pause, Play, SpeakerHigh, SpeakerSlash, X } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { FOOD } from '@/features/bites/logic';
import {
  addMinutes,
  formatClock,
  formatEndsAt,
  MIN,
  pauseTimer,
  progressLeft,
  remainingMs,
  resumeTimer,
  shouldWarn,
  spentMinutes,
  WARNING_MS,
  type TimerState,
} from '@/features/focus/timer';
import { cancelNotification, scheduleFocusEnd } from '@/features/nudges/schedule';
import { useSafeKeepAwake } from '@/hooks/use-safe-keep-awake';
import { haptics } from '@/lib/haptics';
import { backOrHome } from '@/lib/nav';
import { play, startLoop, stopLoop } from '@/lib/sound';
import { en } from '@/i18n/en';
import { PetStandin } from '@/pet/pet-standin';
import { useAppStore } from '@/state/app-store';
import type { FocusSound } from '@/state/schema';
import { duration, textSwapIn } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { TimerRing as TimerRingSlot } from './timer-ring';

const f = en.focus;
/**
 * Leave Focus exactly once. Finishing clears the session, which re-renders <NoSession />, which
 * would leave a second time: that second router.back() was the "GO_BACK not handled" error.
 */
let exiting = false;
const exitFocus = () => {
  if (exiting) return;
  exiting = true;
  backOrHome();
};
const SOUNDS: FocusSound[] = ['none', 'brown', 'rain', 'keys'];
const SOUND_LABEL: Record<FocusSound, string> = { none: 'silence', brown: 'brown noise', rain: 'rain', keys: 'soft keys' };

/**
 * Focus = body double (docs/01 §3), direction C "night studio" in both themes.
 * Wall-clock timer, donut ring, keep awake, end notification, 2-min warning, ASMR loops,
 * 2-minute "keep going" card, drift (no penalty), inline leave confirm.
 */
export function FocusScreen() {
  useSafeKeepAwake();
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const focus = useAppStore((s) => s.focus);
  const pet = useAppStore((s) => s.pet);
  const settings = useAppStore((s) => s.settings);
  const patch = useAppStore((s) => s.patchFocus);
  const endFocus = useAppStore((s) => s.endFocus);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [now, setNow] = useState(() => Date.now());
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [line, setLine] = useState<string>(() => (focus?.mode === '2min' ? f.two : f.working(pet.name)));
  const endedChime = useRef(false);

  // a fresh Focus screen may leave again
  useEffect(() => {
    exiting = false;
  }, []);

  // clock: 4 updates a second is plenty for mm:ss (the ring animates on the UI thread)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // ambient sound for the whole session
  useEffect(() => {
    startLoop(useAppStore.getState().settings.focusSound);
    return () => stopLoop();
  }, []);

  const t: TimerState | null = focus
    ? { startedAt: focus.startedAt, endsAt: focus.endsAt, pausedRemaining: focus.pausedRemaining, totalMs: focus.totalMs }
    : null;
  const runKey = t ? `${t.endsAt}|${t.pausedRemaining}|${t.totalMs}` : 'none';
  const paused = t?.pausedRemaining !== null && t?.pausedRemaining !== undefined;
  const left = t ? remainingMs(t, now) : 0;
  const ended = !!t && !paused && left === 0;
  const keepGoing = ended && focus?.mode === '2min' && !focus.rodeWave;

  // end notification follows the run (cancel on pause, re-plan on resume / +5)
  useEffect(() => {
    const st = useAppStore.getState();
    const cur = st.focus;
    if (!cur) return;
    let cancelled = false;
    void cancelNotification(cur.notificationId).then(async () => {
      if (cancelled) return;
      if (cur.pausedRemaining !== null || cur.endsAt <= Date.now()) {
        st.patchFocus({ notificationId: null });
        return;
      }
      const id = await scheduleFocusEnd(cur.endsAt, st.pet.name);
      if (!cancelled) st.patchFocus({ notificationId: id });
    });
    return () => {
      cancelled = true;
    };
  }, [runKey]);

  // 2-minute warning (transitions are hard) + end chime, once each
  useEffect(() => {
    const cur = useAppStore.getState().focus;
    if (!cur || !t || paused) return;
    if (!cur.warned && shouldWarn(t) && left > 0 && left <= WARNING_MS) {
      useAppStore.getState().patchFocus({ warned: true });
      haptics.warning();
      play('chime');
      toast(f.warning);
    }
    if (left === 0 && !endedChime.current) {
      endedChime.current = true;
      haptics.success();
      play('spark');
    }
  });

  // Android back = ask before leaving
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setConfirmLeave(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  if (!focus || !t) {
    return <NoSession color={colors.focusBottom} />;
  }

  const food = FOOD[focus.size];
  const spent = () => spentMinutes(t, Date.now()) + (focus.rodeWave ? 2 : 0);

  const finish = () => {
    void cancelNotification(focus.notificationId);
    const mins = Math.max(1, Math.round(spent()));
    const r = endFocus(true, mins);
    stopLoop();
    haptics.success();
    play('spark');
    if (r) {
      toast(
        f.fed(r.sparks, mins),
        settings.goodThingsJar ? { label: f.goodThing, onPress: () => router.push('/me') } : undefined,
      );
    }
    exitFocus();
  };

  const leave = () => {
    void cancelNotification(focus.notificationId);
    endFocus(false, spent());
    stopLoop();
    exitFocus();
  };

  const cycleSound = () => {
    const nextSound = SOUNDS[(SOUNDS.indexOf(settings.focusSound) + 1) % SOUNDS.length];
    updateSettings({ focusSound: nextSound });
    startLoop(nextSound);
    haptics.select();
  };

  const swapLine = (l: string) => setLine(l);
  const textIn = reduceMotion ? FadeIn.duration(duration.quick) : textSwapIn;

  return (
    <View style={styles.fill}>
      <LinearGradient colors={[colors.focusTop, colors.focusMid, colors.focusBottom]} style={StyleSheet.absoluteFill} />
      <Image source={require('@/assets/images/focus-room.jpg')} style={[StyleSheet.absoluteFill, styles.room]} contentFit="cover" />
      <LinearGradient colors={[colors.sceneDim, colors.focusScrim, colors.focusBottom]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.l }]}>
        <View style={styles.topBar}>
          <PressScale accessibilityRole="button" accessibilityLabel={f.closeLabel} hitSlop={10} onPress={() => setConfirmLeave(true)} style={[styles.round, { backgroundColor: colors.focusGlass }]}>
            <X size={22} weight="bold" color={colors.onFocus} />
          </PressScale>
          <PressScale accessibilityRole="button" accessibilityLabel={`${f.soundLabel}: ${SOUND_LABEL[settings.focusSound]}`} onPress={cycleSound} style={[styles.pill, { backgroundColor: colors.focusGlass }]}>
            {settings.focusSound === 'none' ? <SpeakerSlash size={18} weight="bold" color={colors.onFocus} /> : <SpeakerHigh size={18} weight="bold" color={colors.onFocus} />}
            <Text variant="caption" tone="onFocus">{SOUND_LABEL[settings.focusSound]}</Text>
          </PressScale>
        </View>

        <View style={styles.hero}>
          <Text variant="caption" tone="onFocus2" numberOfLines={1}>
            {f.workingOn} · {focus.biteText}
          </Text>
          <TimerRingSlot left={progressLeft(t, now)} msLeft={left} running={!paused && !ended} runKey={runKey} emoji={food.emoji} />
          <Text variant="timer" tone="onFocus" accessibilityRole="timer" accessibilityLabel={`${Math.ceil(left / MIN)} minutes left`}>
            {formatClock(left)}
          </Text>
          <Text variant="bodyBold" tone="onFocus2">
            {ended ? f.timeUp : f.endsAt(formatEndsAt(paused ? now + left : t.endsAt, settings.clock24h))}
          </Text>
        </View>

        <View style={styles.petRow}>
          <PetStandin size={96} color={pet.color} headphones working={!paused && !ended} />
          <View style={[styles.bubble, { backgroundColor: colors.focusGlass }]}>
            <Animated.View key={line} entering={textIn}>
              <Text variant="bodyBold" tone="onFocus">{line}</Text>
            </Animated.View>
          </View>
        </View>

        {confirmLeave ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} exiting={FadeOut.duration(duration.quick)} style={[styles.card, { backgroundColor: colors.card }]}>
            <Text variant="heading">{f.leaveTitle}</Text>
            <Text tone="ink2">{f.leaveSub}</Text>
            <View style={styles.row}>
              <PressScale accessibilityRole="button" onPress={() => setConfirmLeave(false)} style={[styles.btn, styles.flex, { backgroundColor: colors.cardAlt }]}>
                <Text variant="bodyBold" tone="primary">{f.stay}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" onPress={leave} style={[styles.btn, styles.flex, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep, borderBottomWidth: 5 }]}>
                <Text variant="bodyBold" tone="onPrimary">{f.leave}</Text>
              </PressScale>
            </View>
          </Animated.View>
        ) : keepGoing ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} style={[styles.card, { backgroundColor: colors.focusGlass }]}>
            <Text variant="heading" tone="onFocus">{f.twoDone}</Text>
            <Text tone="onFocus2">{f.twoDoneSub}</Text>
            <PressScale accessibilityRole="button" onPress={() => {
              haptics.medium();
              play('pop');
              endedChime.current = false;
              const startNow = Date.now();
              patch({ rodeWave: true, endsAt: startNow + 10 * MIN, totalMs: 10 * MIN, pausedRemaining: null, warned: false });
              swapLine('see? you’re already IN it.');
            }} style={[styles.btn, { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep, borderBottomWidth: 5 }]}>
              <Text variant="bodyBold" tone="onReward">{f.ride}</Text>
            </PressScale>
            <PressScale accessibilityRole="button" onPress={finish} style={[styles.btn, { backgroundColor: colors.focusGlass }]}>
              <Text variant="bodyBold" tone="onFocus">{f.imDone(pet.name)}</Text>
            </PressScale>
          </Animated.View>
        ) : (
          <View style={styles.controls}>
            <View style={styles.row}>
              <PressScale accessibilityRole="button" disabled={ended} onPress={() => {
                haptics.light();
                const nowMs = Date.now();
                patch(paused ? resumeTimer(t, nowMs) : pauseTimer(t, nowMs));
                swapLine(paused ? f.back : f.paused);
              }} style={[styles.chip, { backgroundColor: colors.focusGlass, opacity: ended ? 0.4 : 1 }]}>
                {paused ? <Play size={18} weight="fill" color={colors.onFocus} /> : <Pause size={18} weight="fill" color={colors.onFocus} />}
                <Text variant="bodyBold" tone="onFocus">{paused ? f.resume : f.pause}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" onPress={() => {
                haptics.light();
                play('pop');
                endedChime.current = false;
                const base = ended ? { ...t, endsAt: Date.now(), totalMs: t.totalMs } : t;
                patch(addMinutes(base, 5));
              }} style={[styles.chip, { backgroundColor: colors.focusGlass }]}>
                <Text variant="bodyBold" tone="onFocus">{f.plus5}</Text>
              </PressScale>
            </View>
            <PressScale accessibilityRole="button" onPress={finish} style={[styles.btn, { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep, borderBottomWidth: 5 }]}>
              <Text variant="bodyBold" tone="onReward">{f.done(pet.name)} {food.emoji}</Text>
            </PressScale>
            <PressScale accessibilityRole="button" hitSlop={8} onPress={() => {
              patch({ drifts: focus.drifts + 1 });
              play('boop');
              swapLine(f.drifted[focus.drifts % f.drifted.length]);
            }} style={styles.link}>
              <Text variant="bodyBold" tone="onFocus2">{f.driftBtn}</Text>
            </PressScale>
          </View>
        )}
      </View>
    </View>
  );
}


/** Opened without a running session (old link, notification after finishing): go home. */
function NoSession({ color }: { color: string }) {
  useEffect(() => {
    exitFocus();
  }, []);
  return <View style={[styles.fill, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  room: { opacity: 0.55 },
  content: { flex: 1, paddingHorizontal: space.gutter, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pill: { minHeight: 40, borderRadius: radius.chip, paddingHorizontal: space.m, flexDirection: 'row', alignItems: 'center', gap: space.s },
  hero: { alignItems: 'center', gap: space.s },
  petRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.m },
  bubble: { flex: 1, borderRadius: radius.card, padding: space.l, marginBottom: space.l },
  controls: { gap: space.m },
  row: { flexDirection: 'row', gap: space.m },
  flex: { flex: 1 },
  chip: { flex: 1, minHeight: 48, borderRadius: radius.button, flexDirection: 'row', gap: space.s, alignItems: 'center', justifyContent: 'center' },
  btn: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.l },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  card: { borderRadius: radius.card, padding: space.xl, gap: space.m },
});
