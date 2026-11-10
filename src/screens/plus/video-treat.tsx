import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { ADS } from '@/config/ads';
import { useLook } from '@/features/closet/use-look';
import { adsLeftToday, afterAd } from '@/features/plus/ad-reward';
import { en } from '@/i18n/en';
import { showRewarded } from '@/lib/ads';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Burst } from '@/pet/burst';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { dayKey } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const v = en.plus.video;
type Phase = 'idle' | 'loading' | 'thanks' | 'later' | 'none';

/**
 * "Treat your pet": the only ad in the app (Android). The person chooses to watch one short
 * video and the pet gets sparks. The feeling is a happy pet, never a sad or begging one: closing
 * the video early is "no worries", the daily limit is "I'm full" (no guilt, CLAUDE.md).
 * Sparks from videos count for unlocking Plus but never for the level (stats.total is untouched).
 */
export function VideoTreat() {
  const { colors } = useTheme();
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const adSparks = useAppStore((s) => s.stats.adSparks);
  const [phase, setPhase] = useState<Phase>('idle');
  const [burst, setBurst] = useState(0);
  const left = adsLeftToday(adSparks, dayKey(), ADS.maxPerDay);
  const full = left <= 0;

  const watch = async () => {
    if (phase === 'loading' || full) return;
    setPhase('loading');
    haptics.light();
    const r = await showRewarded().catch(() => 'unavailable' as const);
    if (r !== 'earned') {
      setPhase(r === 'closed' ? 'later' : 'none');
      return;
    }
    const st = useAppStore.getState();
    const next = afterAd(st.stats.adSparks, dayKey(), ADS.maxPerDay);
    if (next) useAppStore.setState({ stats: { ...st.stats, sparks: st.stats.sparks + ADS.rewardSparks, adSparks: next } });
    setBurst((b) => b + 1);
    haptics.success();
    play('spark');
    setPhase('thanks');
  };

  const mood: Mood = phase === 'thanks' ? 'love' : phase === 'loading' ? 'excited' : full ? 'sleepy' : 'happy';
  const line =
    phase === 'thanks' ? v.thanks(ADS.rewardSparks) : full ? v.full : phase === 'later' ? v.later : phase === 'none' ? v.none : v.ask(petName, ADS.rewardSparks);
  const off = full || phase === 'loading';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.head}>
        <View style={styles.pet}>
          <Burst id={burst} size={120} />
          <Pet size={64} color={look.color} hat={look.hat} face={look.face} stage={look.stage} mood={mood} />
        </View>
        <View style={styles.flex}>
          <Text variant="bodyBold">{v.title(petName)}</Text>
          <Text variant="subhead" tone="ink2" accessibilityLiveRegion="polite">{line}</Text>
        </View>
      </View>
      <PressScale
        accessibilityRole="button"
        accessibilityState={{ disabled: off, busy: phase === 'loading' }}
        disabled={off}
        onPress={() => void watch()}
        style={[styles.btn, { backgroundColor: colors.fill, opacity: off ? 0.5 : 1 }]}>
        <Icon name="play" size={16} color={colors.ink} />
        <Text variant="bodyBold">{phase === 'loading' ? v.loading : v.watch(ADS.rewardSparks)}</Text>
      </PressScale>
      <Text variant="caption" tone="ink2" style={styles.center}>{v.left(left, ADS.maxPerDay)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.m, borderRadius: radius.card, padding: space.l, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  pet: { width: 72, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  center: { textAlign: 'center' },
  btn: { minHeight: 52, borderRadius: radius.button, flexDirection: 'row', gap: space.s, alignItems: 'center', justifyContent: 'center' },
});
