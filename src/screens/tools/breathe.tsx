import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Glass } from '@/components/glass';
import { GuideHelp } from '@/components/guide/page-guide';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { BREATH_PATTERNS, type BreathPattern } from '@/features/toolkit/logic';
import { useSafeKeepAwake } from '@/hooks/use-safe-keep-awake';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

import { Button, Card, toolStyles } from './parts';

const t = en.tools.breathe;
const STAGE = 260;

/**
 * Breathing cues: one soft, clean synth tone (sine pad, no noise), made to the phase length.
 * In: swells up over 4 s. Out: falls and fades over 4, 6 or 8 s (assets/sounds/CREDITS.md).
 */
const CUES = {
  in: require('@/assets/sounds/breathe-in.m4a'),
  out4: require('@/assets/sounds/breathe-out-4.m4a'),
  out6: require('@/assets/sounds/breathe-out.m4a'),
  out8: require('@/assets/sounds/breathe-out-8.m4a'),
} as const;
type Cue = keyof typeof CUES;
const cueFor = (kind: 'in' | 'out', seconds: number): Cue => (kind === 'in' ? 'in' : seconds <= 4 ? 'out4' : seconds >= 8 ? 'out8' : 'out6');

/** Fade a cue out over 250 ms, then pause it (no click when you stop or mute mid-tone). */
function hushPlayer(p: AudioPlayer) {
  if (!p.playing) return;
  const from = p.volume;
  let i = 0;
  const id = setInterval(() => {
    i += 1;
    try {
      p.volume = from * (1 - i / 5);
      if (i >= 5) p.pause();
    } catch {
      i = 5; // the page closed and released the player
    }
    if (i >= 5) clearInterval(id);
  }, 50);
}

function startPlayer(p: AudioPlayer, volume: number) {
  try {
    p.volume = volume;
    void p.seekTo(0);
    p.play();
  } catch {
    // sound is never critical
  }
}

function useBreathCues() {
  const a = useAudioPlayer(CUES.in);
  const b = useAudioPlayer(CUES.out4);
  const c = useAudioPlayer(CUES.out6);
  const d = useAudioPlayer(CUES.out8);
  const players = useMemo(() => ({ in: a, out4: b, out6: c, out8: d }), [a, b, c, d]);
  const hush = useCallback(() => {
    try {
      Object.values(players).forEach(hushPlayer);
    } catch {
      // sound is never critical
    }
  }, [players]);
  const play = useCallback(
    (cue: Cue) => {
      const { sound, volume } = useAppStore.getState().settings;
      if (!sound) return;
      startPlayer(players[cue], volume * 0.9);
    },
    [players],
  );
  return { play, hush };
}

function KeepAwake() {
  useSafeKeepAwake('breathe');
  return null;
}

/**
 * Breathe: the pet grows on the in-breath and shrinks on the out-breath. One tick a second drives
 * the phases (no setState per frame); the grow/shrink is one long Reanimated timing per phase.
 * Reduce Motion: no size change, the halo fades brighter / dimmer instead. Haptic on each phase, and a
 * soft singing-bowl cue on in / out (sound toggle respected, plus a mute on this page).
 */
export function BreatheTool() {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const [patternId, setPatternId] = useState<BreathPattern['id']>('calm');
  const pattern = BREATH_PATTERNS.find((p) => p.id === patternId) ?? BREATH_PATTERNS[0];
  const [running, setRunning] = useState(false);
  // one state object so the tick updater stays pure (no setState inside another updater)
  const [tick, setTick] = useState({ phase: 0, elapsed: 0, rounds: 0 });
  const { phase, elapsed, rounds } = tick;
  const [finished, setFinished] = useState<number | null>(null);
  const soundOn = useAppStore((s) => s.settings.sound);
  const [muted, setMuted] = useState(false);
  const cues = useBreathCues();

  const v = useSharedValue(0);
  const current = pattern.phases[phase];

  // one tick a second: count up inside the phase, then move to the next one
  useEffect(() => {
    if (!running) return;
    const phases = pattern.phases;
    const id = setInterval(() => {
      setTick((k) => {
        if (k.elapsed + 1 < phases[k.phase].seconds) return { ...k, elapsed: k.elapsed + 1 };
        const next = (k.phase + 1) % phases.length;
        return { phase: next, elapsed: 0, rounds: next === 0 ? k.rounds + 1 : k.rounds };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, pattern]);

  // each phase: haptic + one long ease toward big (in) or small (out); hold keeps the size
  useEffect(() => {
    if (!running) return;
    if (current.kind === 'hold') haptics.select();
    else haptics.light();
    if (current.kind !== 'hold' && !muted) cues.play(cueFor(current.kind, current.seconds));
    if (current.kind !== 'hold') v.set(withTiming(current.kind === 'in' ? 1 : 0, { duration: current.seconds * 1000, easing: easing.inOut }));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- muting mid-phase shouldn't replay the cue
  }, [running, phase, current.kind, current.seconds, v]);

  const start = () => {
    setTick({ phase: 0, elapsed: 0, rounds: 0 });
    setFinished(null);
    setRunning(true);
  };
  const stop = () => {
    setRunning(false);
    setFinished(rounds);
    cues.hush();
    cancelAnimation(v);
    v.set(withTiming(0, { duration: duration.medium, easing: easing.smoothOut }));
    haptics.success();
  };

  const toggleMute = () => {
    haptics.select();
    setMuted((m) => {
      if (!m) cues.hush();
      return !m;
    });
  };

  const petStyle = useAnimatedStyle(() => ({ transform: [{ scale: reduceMotion ? 1 : 0.82 + 0.3 * v.get() }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.35 + 0.65 * v.get() : 0.55 + 0.45 * v.get(),
    transform: [{ scale: reduceMotion ? 1 : 0.7 + 0.42 * v.get() }],
  }));

  const label = !running ? t.ready : current.kind === 'in' ? t.in : current.kind === 'out' ? t.out : t.hold;
  const left = running ? current.seconds - elapsed : null;

  return (
    <Screen back title={en.tools.tiles.breathe.title} right={
        <View style={styles.right}>
          {soundOn ? (
            <PressScale accessibilityRole="button" accessibilityLabel={muted ? t.soundOn : t.soundOff} onPress={toggleMute}>
              <Glass interactive radius={22} style={styles.mute}>
                <Icon name={muted ? 'mute' : 'sound'} size={20} color={colors.ink} />
              </Glass>
            </PressScale>
          ) : null}
          <GuideHelp id="breathe" auto />
        </View>
      }>
      {running ? <KeepAwake /> : null}
      <Text variant="subhead" tone="ink2" style={toolStyles.intro}>{t.intro}</Text>

      <Card style={styles.stageCard}>
        <View style={styles.stage} accessibilityLiveRegion="polite" accessible accessibilityLabel={left ? `${label}, ${left}` : label}>
          <Animated.View style={[styles.halo, { backgroundColor: colors.primarySoft, borderColor: colors.primary }, haloStyle]} />
          <Animated.View style={petStyle}>
            <Pet size={150} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={running ? 'calm' : 'happy'} still={running} />
          </Animated.View>
        </View>
        <Animated.View key={`${label}-${phase}-${running}`} entering={FadeIn.duration(duration.quick)} style={toolStyles.center}>
          <Text variant="title2">{label}</Text>
          <Text variant="subhead" tone="ink2">
            {left !== null ? `${left}  ·  ${t.rounds(rounds)}` : finished ? t.done(finished) : pattern.hint}
          </Text>
        </Animated.View>
      </Card>

      <Segmented
        accessibilityLabel={t.pattern}
        value={patternId}
        onChange={(id) => {
          setPatternId(id);
          setTick((k) => ({ ...k, phase: 0, elapsed: 0 }));
          haptics.select();
        }}
        options={BREATH_PATTERNS.map((p) => ({ value: p.id, label: p.label }))}
      />
      {running ? <Text variant="caption" tone="ink2" style={styles.hint}>{pattern.hint}</Text> : null}

      {running ? <Button label={t.stop} soft onPress={stop} /> : <Button label={t.start} icon="play" onPress={start} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stageCard: { alignItems: 'center', paddingVertical: space.xl },
  stage: { width: STAGE, height: STAGE, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: STAGE, height: STAGE, borderRadius: STAGE / 2, borderWidth: 2 },
  hint: { textAlign: 'center' },
  right: { flexDirection: 'row', gap: space.s },
  mute: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
