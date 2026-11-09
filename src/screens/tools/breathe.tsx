import { useEffect, useState } from 'react';
import { GuideHelp } from '@/components/guide/page-guide';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { BREATH_PATTERNS, type BreathPattern } from '@/features/toolkit/logic';
import { useSafeKeepAwake } from '@/hooks/use-safe-keep-awake';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { Pet } from '@/pet/pet';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

import { Button, Card, toolStyles } from './parts';

const t = en.tools.breathe;
const STAGE = 260;

function KeepAwake() {
  useSafeKeepAwake('breathe');
  return null;
}

/**
 * Breathe: the pet grows on the in-breath and shrinks on the out-breath. One tick a second drives
 * the phases (no setState per frame); the grow/shrink is one long Reanimated timing per phase.
 * Reduce Motion: no size change, the halo fades brighter / dimmer instead. Haptic on each phase.
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
    if (current.kind !== 'hold') v.set(withTiming(current.kind === 'in' ? 1 : 0, { duration: current.seconds * 1000, easing: easing.inOut }));
  }, [running, phase, current.kind, current.seconds, v]);

  const start = () => {
    setTick({ phase: 0, elapsed: 0, rounds: 0 });
    setFinished(null);
    setRunning(true);
  };
  const stop = () => {
    setRunning(false);
    setFinished(rounds);
    cancelAnimation(v);
    v.set(withTiming(0, { duration: duration.medium, easing: easing.smoothOut }));
    haptics.success();
  };

  const petStyle = useAnimatedStyle(() => ({ transform: [{ scale: reduceMotion ? 1 : 0.82 + 0.3 * v.get() }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.35 + 0.65 * v.get() : 0.55 + 0.45 * v.get(),
    transform: [{ scale: reduceMotion ? 1 : 0.7 + 0.42 * v.get() }],
  }));

  const label = !running ? t.ready : current.kind === 'in' ? t.in : current.kind === 'out' ? t.out : t.hold;
  const left = running ? current.seconds - elapsed : null;

  return (
    <Screen back title={en.tools.tiles.breathe.title} right={<GuideHelp id="breathe" auto />}>
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
});
