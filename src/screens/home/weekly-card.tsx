import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { COLORS } from '@/features/closet/items';
import { colorForWeek, lastWeekRecap, petWeek } from '@/features/weekly/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import { duration, scale, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { petColors, radius, space } from '@/theme/tokens';

const w = en.weekly;

/**
 * Once a pet week (from day 7): last week's fed bites, then this week's free surprise colour,
 * revealed with a small pop. No guilt: an empty week reads as a fresh plate, never "missed".
 */
export function WeeklyCard({ now }: { now: Date }) {
  const { colors, reduceMotion } = useTheme();
  const pet = useAppStore((s) => s.pet);
  const sessions = useAppStore((s) => s.sessions);
  const firstOpen = useAppStore((s) => s.settings.firstOpen);
  const week = petWeek(firstOpen, now);
  const recap = lastWeekRecap(sessions, firstOpen, now);
  const color = colorForWeek(week);
  const item = color ? COLORS.find((c) => c.id === color) : undefined;

  const close = (wear: boolean) => {
    const st = useAppStore.getState();
    if (wear && color) {
      st.patchPet({ color });
      haptics.success();
      play('spark');
    } else {
      haptics.select();
    }
    st.updateSettings({ weekSeen: week });
  };

  return (
    <Animated.View
      entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <Icon name="gift" size={16} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text variant="caption" tone="ink2">{item ? w.titleGift : w.title}</Text>
          <Text variant="body">{recap.bites > 0 ? w.recap(pet.name, recap.bites, recap.minutes) : w.fresh}</Text>
        </View>
      </View>
      {item && color ? (
        <View style={[styles.gift, { backgroundColor: colors.fill }]}>
          <View style={styles.swatchBox}>
            <Animated.View
              entering={reduceMotion ? FadeIn.duration(duration.quick) : ZoomIn.springify().damping(spring.pop.damping).stiffness(spring.pop.stiffness).delay(180).withInitialValues({ transform: [{ scale: scale.burstFrom }] })}
              accessible={false}
              style={[styles.swatch, { backgroundColor: petColors[color], borderColor: colors.card }]}
            />
          </View>
          <View style={styles.flex}>
            <Text variant="bodyBold">{w.gift(item.name)}</Text>
            <Text variant="caption" tone="ink2">{w.giftSub}</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.row}>
        <PressScale accessibilityRole="button" onPress={() => close(false)} style={[styles.btn, { backgroundColor: colors.fill }]}>
          <Text variant="bodyBold">{w.ok}</Text>
        </PressScale>
        {item ? (
          <PressScale accessibilityRole="button" accessibilityLabel={w.tryLabel(item.name, pet.name)} onPress={() => close(true)} style={[styles.btn, { backgroundColor: colors.primary }]}>
            <Text variant="bodyBold" tone="onPrimary">{w.tryOn}</Text>
          </PressScale>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.m, borderRadius: radius.card - 6, padding: space.l, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  gift: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, borderRadius: radius.row },
  swatchBox: { width: 40, height: 40 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3 },
  row: { flexDirection: 'row', gap: space.s },
  btn: { flex: 1, minHeight: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
