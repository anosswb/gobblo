import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { ADS, USE_REAL_ADS } from '@/config/ads';
import { useLook } from '@/features/closet/use-look';
import { useVideoTreat } from '@/features/plus/use-video-treat';
import { en } from '@/i18n/en';
import { Burst } from '@/pet/burst';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const v = en.plus.video;

/**
 * "Treat your pet": the only ad in the app (Android). The person chooses to watch one short
 * video and the pet gets sparks. The feeling is a happy pet, never a sad or begging one: closing
 * the video early is "no worries", the daily limit is "I'm full" (no guilt, CLAUDE.md).
 * Sparks from videos buy Plus and Closet items but never count for the level (stats.total is
 * untouched). The logic is shared with the Closet offer (features/plus/use-video-treat).
 */
export function VideoTreat() {
  const { colors } = useTheme();
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const { phase, reason, left, full, watch: watchVideo, preload, trackShown } = useVideoTreat('plus');
  const [burst, setBurst] = useState(0);

  // anonymous count: the offer card was shown (once per visit), with how many videos are left today
  useEffect(() => {
    trackShown();
  }, [trackShown]);

  // get one video ready in the background, only when an offer can be shown
  useEffect(() => {
    if (left > 0) preload();
  }, [left, preload]);

  const watch = async () => {
    if (await watchVideo()) setBurst((b) => b + 1);
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
          {phase === 'none' && reason && !USE_REAL_ADS ? (
            <Text variant="caption" tone="ink2" selectable>{reason}</Text>
          ) : null}
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
