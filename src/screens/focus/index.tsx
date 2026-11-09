import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import {
  addMinutes,
  formatClock,
  formatEndsAt,
  MIN,
  pauseTimer,
  progressLeft,
  remainingMs,
  restartTimer,
  resumeTimer,
  shouldWarn,
  spentMinutes,
  WARNING_MS,
  type TimerState,
} from '@/features/focus/timer';
import { cancelNotification, scheduleFocusEnd } from '@/features/nudges/schedule';
import { useSafeKeepAwake } from '@/hooks/use-safe-keep-awake';
import { haptics } from '@/lib/haptics';
import { play, startLoop, stopLoop } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useLook } from '@/features/closet/use-look';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { PageGuide } from '@/components/guide/page-guide';
import { guideCopy } from '@/i18n/guides.en';
import type { FocusSound } from '@/state/schema';
import { duration, textSwapIn } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { TimerRing as TimerRingSlot } from './timer-ring';
import { backOrHome } from '@/lib/nav';
import { biteIcon } from '@/features/bites/bite-icon';

const f = en.focus;
/** the modal's close animation; the session is saved after it */
const CLOSE_MS = 380;
const exitFocus = backOrHome;
const SOUNDS: FocusSound[] = ['none', 'brown', 'rain', 'keys'];
const SOUND_LABEL: Record<FocusSound, string> = { none: 'Silence', brown: 'Brown noise', rain: 'Rain', keys: 'Soft keys' };

/**
 * Focus = body double (docs/01 §3), direction C "night studio" in both themes.
 * Wall-clock timer, donut ring, keep awake, end notification, 2-min warning, ASMR loops,
 * 2-minute "keep going" card, drift (no penalty), inline leave confirm.
 */
export function FocusScreen() {
  const [helpOpen, setHelpOpen] = useState(false);
  useSafeKeepAwake('focus', useAppStore((st) => st.settings.focusKeepAwake));
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  // short phones (iPhone SE, 360×640 Android): smaller ring, numerals and pet so nothing clips
  const compact = useWindowDimensions().height < 720;
  const focus = useAppStore((s) => s.focus);
  const pet = useAppStore((s) => s.pet);
  const look = useLook();
  const stage = look.stage;
  const settings = useAppStore((s) => s.settings);
  const patch = useAppStore((s) => s.patchFocus);
  const endFocus = useAppStore((s) => s.endFocus);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [now, setNow] = useState(() => Date.now());
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [line, setLine] = useState<string>(() => (focus?.mode === '2min' ? f.two : f.working(pet.name)));
  const endedChime = useRef(false);
  // finishing clears the session, which also renders <NoSession>: leave the screen only once
  const leaving = useRef(false);
  const exit = () => {
    if (leaving.current) return;
    leaving.current = true;
    exitFocus();
  };

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
    return <NoSession color={colors.roomBottom} onExit={exit} />;
  }

  const spent = () => spentMinutes(t, Date.now()) + (focus.rodeWave ? 2 : 0);

  const finish = () => {
    void cancelNotification(focus.notificationId);
    const mins = Math.max(1, Math.round(spent()));
    stopLoop();
    haptics.success();
    play('spark');
    // close first, save right after: the room slides away intact and Home sees the bite land
    exit();
    setTimeout(() => {
      const r = endFocus(true, mins);
      if (r) {
        toast(
          f.fed(r.sparks, mins),
          settings.goodThingsJar ? { label: f.goodThing, onPress: () => router.push('/me') } : undefined,
        );
      }
    }, CLOSE_MS);
  };

  const leave = () => {
    void cancelNotification(focus.notificationId);
    const mins = spent();
    stopLoop();
    exit();
    setTimeout(() => endFocus(false, mins), CLOSE_MS);
  };

  const cycleSound = () => {
    const nextSound = SOUNDS[(SOUNDS.indexOf(settings.focusSound) + 1) % SOUNDS.length];
    updateSettings({ focusSound: nextSound });
    startLoop(nextSound);
    haptics.select();
  };

  const swapLine = (l: string) => setLine(l);
  const petMood: Mood = ended ? 'celebrating' : paused ? 'calm' : focus.drifts > 0 && line !== f.working(pet.name) && line !== f.two ? 'curious' : 'focused';
  const textIn = reduceMotion ? FadeIn.duration(duration.quick) : textSwapIn;

  return (
    <View style={styles.fill}>
      <LinearGradient colors={[colors.roomTop, colors.roomMid, colors.roomBottom]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="focusGlow" cx="50%" cy="34%" r="45%">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.28} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="34" r="60" fill="url(#focusGlow)" />
      </Svg>

      <View style={[styles.content, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.l }]}>
        <View style={styles.topBar}>
          <PressScale accessibilityRole="button" accessibilityLabel={f.closeLabel} hitSlop={10} onPress={() => setConfirmLeave(true)} style={[styles.round, { backgroundColor: colors.roomGlass, borderColor: colors.roomGlass }]}>
            <Icon name="close" size={16} weight="bold" color={colors.roomInk} />
          </PressScale>
          <View style={styles.topRight}>
          <PressScale accessibilityRole="button" accessibilityLabel={`${f.soundLabel}: ${SOUND_LABEL[settings.focusSound]}`} onPress={cycleSound} style={[styles.pill, { backgroundColor: colors.roomGlass, borderColor: colors.roomGlass }]}>
            <Icon name={settings.focusSound === 'none' ? 'mute' : 'sound'} size={16} color={colors.roomInk} />
            <Text variant="caption" tone="roomInk" style={styles.semi}>{SOUND_LABEL[settings.focusSound]}</Text>
          </PressScale>
          {/* "?" in the room's own colours (the timer keeps running behind the guide) */}
          <PressScale accessibilityRole="button" accessibilityLabel={guideCopy.help} hitSlop={4} onPress={() => { haptics.select(); setHelpOpen(true); }} style={[styles.round, { backgroundColor: colors.roomGlass, borderColor: colors.roomGlass }]}>
            <Icon name="help" size={18} color={colors.roomInk} />
          </PressScale>
          </View>
        </View>
        <PageGuide id="focus" visible={helpOpen} onClose={() => setHelpOpen(false)} />

        <View style={styles.hero}>
          <Text variant="subhead" tone="roomInk2" numberOfLines={1} style={styles.workingOn}>
            {f.workingOn} · {focus.biteText}
          </Text>
          <TimerRingSlot left={progressLeft(t, now)} msLeft={left} running={!paused && !ended} runKey={runKey} emoji={biteIcon(focus.biteText, focus.size)} size={compact ? 168 : 224} />
          <Text variant="timer" tone="roomInk" style={compact ? styles.timerCompact : undefined} accessibilityRole="timer" accessibilityLabel={`${Math.ceil(left / MIN)} minutes left`}>
            {formatClock(left)}
          </Text>
          <Text variant="subhead" tone="roomInk2">
            {ended ? f.timeUp : f.endsAt(formatEndsAt(paused ? now + left : t.endsAt, settings.clock24h))}
          </Text>
        </View>

        <View style={styles.petRow}>
          <Pet size={compact ? 70 : 92} color={look.color} hat={look.hat} face={look.face} mood={petMood} stage={stage} headphones working={!paused && !ended} />
          <View style={[styles.bubble, compact && styles.bubbleCompact, { backgroundColor: colors.roomGlass, borderColor: colors.roomGlass }]}>
            <Animated.View key={line} entering={textIn}>
              <Text variant="body" tone="roomInk">{line}</Text>
            </Animated.View>
          </View>
        </View>

        {confirmLeave ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} exiting={FadeOut.duration(duration.quick)} style={[styles.card, styles.alert, { backgroundColor: colors.card }]}>
            <Text variant="heading" style={styles.center}>{f.leaveTitle}</Text>
            <Text variant="subhead" tone="ink2" style={styles.center}>{f.leaveSub}</Text>
            <View style={styles.row}>
              <PressScale accessibilityRole="button" onPress={() => setConfirmLeave(false)} style={[styles.btn, styles.flex, { backgroundColor: colors.primary }]}>
                <Text variant="bodyBold" tone="onPrimary">{f.stay}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" onPress={leave} style={[styles.btn, styles.flex, { backgroundColor: colors.fill }]}>
                <Text variant="bodyBold">{f.leave}</Text>
              </PressScale>
            </View>
          </Animated.View>
        ) : confirmRestart ? (
          // "are you sure?": a mis-tap must never wipe the time already done
          <Animated.View entering={FadeIn.duration(duration.fast)} exiting={FadeOut.duration(duration.quick)} style={[styles.card, styles.alert, { backgroundColor: colors.card }]}>
            <Text variant="heading" style={styles.center}>{f.restartTitle}</Text>
            <Text variant="subhead" tone="ink2" style={styles.center}>{f.restartSub(formatClock(t.totalMs))}</Text>
            <View style={styles.row}>
              <PressScale accessibilityRole="button" onPress={() => setConfirmRestart(false)} style={[styles.btn, styles.flex, { backgroundColor: colors.primary }]}>
                <Text variant="bodyBold" tone="onPrimary">{f.restartNo}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" onPress={() => {
                haptics.medium();
                play('pop');
                endedChime.current = false;
                patch({ ...restartTimer(t, Date.now()), warned: false });
                setConfirmRestart(false);
                swapLine(f.restarted);
              }} style={[styles.btn, styles.flex, { backgroundColor: colors.fill }]}>
                <Text variant="bodyBold">{f.restartYes}</Text>
              </PressScale>
            </View>
          </Animated.View>
        ) : keepGoing ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} style={[styles.card, { backgroundColor: colors.roomGlass, borderColor: colors.roomGlass }]}>
            <Text variant="heading" tone="roomInk">{f.twoDone}</Text>
            <Text variant="subhead" tone="roomInk2">{f.twoDoneSub}</Text>
            <PressScale accessibilityRole="button" onPress={() => {
              haptics.medium();
              play('pop');
              endedChime.current = false;
              const startNow = Date.now();
              patch({ rodeWave: true, endsAt: startNow + 10 * MIN, totalMs: 10 * MIN, pausedRemaining: null, warned: false });
              swapLine('See? You’re already IN it.');
            }} style={[styles.btn, { backgroundColor: colors.reward }]}>
              <Text variant="bodyBold" tone="onReward">{f.ride}</Text>
            </PressScale>
            <PressScale accessibilityRole="button" onPress={finish} style={[styles.btn, { backgroundColor: colors.roomGlass }]}>
              <Text variant="bodyBold" tone="roomInk">{f.imDone(pet.name)}</Text>
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
              }} style={[styles.chip, { backgroundColor: colors.roomGlass, opacity: ended ? 0.4 : 1 }]}>
                <Icon name={paused ? 'play' : 'pause'} size={16} color={colors.roomInk} />
                <Text variant="bodyBold" tone="roomInk">{paused ? f.resume : f.pause}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" onPress={() => {
                haptics.light();
                play('pop');
                endedChime.current = false;
                const base = ended ? { ...t, endsAt: Date.now(), totalMs: t.totalMs } : t;
                patch(addMinutes(base, 5));
              }} style={[styles.chip, { backgroundColor: colors.roomGlass }]}>
                <Text variant="bodyBold" tone="roomInk">{f.plus5}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" accessibilityLabel={f.restartTitle} onPress={() => {
                haptics.light();
                setConfirmRestart(true);
              }} style={[styles.chip, { backgroundColor: colors.roomGlass }]}>
                <Icon name="reset" size={16} color={colors.roomInk} />
                <Text variant="bodyBold" tone="roomInk">{f.restart}</Text>
              </PressScale>
            </View>
            <PressScale accessibilityRole="button" onPress={finish} style={[styles.btn, { backgroundColor: colors.reward }]}>
              <Text variant="bodyBold" tone="onReward">{f.done(pet.name)}</Text>
            </PressScale>
            <PressScale accessibilityRole="button" hitSlop={8} onPress={() => {
              patch({ drifts: focus.drifts + 1 });
              play('boop');
              swapLine(f.drifted[focus.drifts % f.drifted.length]);
            }} style={styles.link}>
              <Text variant="subhead" tone="roomInk2">{f.driftBtn}</Text>
            </PressScale>
          </View>
        )}
      </View>
    </View>
  );
}


/** Opened without a running session (old link, notification after finishing): go home. */
function NoSession({ color, onExit }: { color: string; onExit: () => void }) {
  useEffect(() => {
    onExit();
    // once, on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <View style={[styles.fill, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { textAlign: 'center' },
  semi: { fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: space.gutter + 4, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  pill: { height: 44, borderRadius: radius.chip, paddingHorizontal: space.l, flexDirection: 'row', alignItems: 'center', gap: space.s, borderWidth: StyleSheet.hairlineWidth },
  hero: { alignItems: 'center', gap: space.xs },
  workingOn: { maxWidth: '90%', marginBottom: space.s },
  petRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.m },
  bubble: { flex: 1, borderRadius: 22, borderBottomStartRadius: 6, padding: space.l, marginBottom: space.xxl, borderWidth: StyleSheet.hairlineWidth },
  controls: { gap: space.m },
  timerCompact: { fontSize: 58, lineHeight: 64 },
  bubbleCompact: { marginBottom: space.m, padding: space.m },
  row: { flexDirection: 'row', gap: space.m },
  flex: { flex: 1 },
  chip: { flex: 1, minHeight: 50, borderRadius: radius.button, flexDirection: 'row', gap: space.s, alignItems: 'center', justifyContent: 'center' },
  btn: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.l },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  card: { borderRadius: radius.card, padding: space.xl, gap: space.m, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent' },
  alert: { alignItems: 'stretch' },
});
