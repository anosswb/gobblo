import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Platform, StyleSheet, View, type HostInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { APP_NAME } from '@/config/app';
import { brainType } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

/**
 * Shareable brain card (docs/01 §8): gradient card with the pet and a title from behaviour,
 * rendered to a PNG and shared with the native sheet. The app-name watermark is free marketing.
 */
export function BrainCard() {
  const { colors } = useTheme();
  const ref = useRef<HostInstance>(null);
  const stats = useAppStore((s) => s.stats);
  const pet = useAppStore((s) => s.pet);
  const bt = brainType(stats, pet.name);

  const share = async () => {
    haptics.light();
    if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) {
      toast('sharing works on your phone ✦');
      return;
    }
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      play('spark');
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'share your brain card' });
    } catch {
      toast('couldn’t make the image. try again?');
    }
  };

  return (
    <View style={styles.wrap}>
      <View ref={ref} collapsable={false} style={styles.cardShadow}>
        <LinearGradient colors={[colors.focusTop, colors.focusMid, colors.focusBottom]} style={styles.card}>
          <View style={styles.flex}>
            <Text variant="caption" tone="onFocus2">
              my brain type
            </Text>
            <Text variant="title2" tone="onFocus">
              {bt.title}
            </Text>
            <Text variant="caption" tone="onFocus2">
              {bt.line}
            </Text>
            <View style={styles.stats}>
              <Text variant="caption" tone="onFocus">
                🍪 {stats.eaten} {stats.eaten === 1 ? 'bite' : 'bites'} · ⏱ {stats.minutes} min · ↩︎ {stats.comebacks} {stats.comebacks === 1 ? 'comeback' : 'comebacks'}
              </Text>
            </View>
            <Text variant="caption" tone="onFocus2" style={styles.mark}>
              {APP_NAME.toLowerCase()} · feed it by starting
            </Text>
          </View>
          <Pet size={92} color={pet.color} mood="confident" />
        </LinearGradient>
      </View>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel="share your brain card"
        onPress={() => void share()}
        style={[styles.share, { backgroundColor: colors.primarySoft }]}>
        <Icon name="share" size={18} color={colors.primary} />
        <Text variant="bodyBold" tone="primary">
          share my brain card
        </Text>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.m },
  flex: { flex: 1, gap: space.xs },
  cardShadow: { borderRadius: radius.card, overflow: 'hidden' },
  card: { flexDirection: 'row', alignItems: 'flex-end', padding: space.xl, gap: space.m, minHeight: 190 },
  stats: { marginTop: space.s },
  mark: { marginTop: space.m, opacity: 0.8 },
  share: {
    minHeight: 50,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s,
  },
});
