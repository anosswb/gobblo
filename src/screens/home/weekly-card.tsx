import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { COLORS, HATS, ROOMS, type RoomId } from '@/features/closet/items';
import { useLook } from '@/features/closet/use-look';
import { dropForWeek, lastWeekRecap, petWeek } from '@/features/weekly/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import type { HatId } from '@/pet/wardrobe';
import { useAppStore } from '@/state/app-store';
import { duration, scale, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { petColors, radius, roomGradients, space, type PetColor } from '@/theme/tokens';

const w = en.weekly;

/**
 * Once a pet week (from day 7): last week's fed bites, then this week's free surprise (a hat,
 * a colour or a room, in turn), revealed with a small pop. No guilt: an empty week reads as a
 * fresh plate, never "missed".
 */
export function WeeklyCard({ now }: { now: Date }) {
  const { colors, reduceMotion } = useTheme();
  const pet = useAppStore((s) => s.pet);
  const sessions = useAppStore((s) => s.sessions);
  const firstOpen = useAppStore((s) => s.settings.firstOpen);
  const week = petWeek(firstOpen, now);
  const recap = lastWeekRecap(sessions, firstOpen, now);
  const look = useLook();
  const drop = dropForWeek(week);
  const item = drop ? [...HATS, ...COLORS, ...ROOMS].find((i) => i.slot === drop.slot && i.id === drop.id) : undefined;

  const close = (wear: boolean) => {
    const st = useAppStore.getState();
    if (wear && drop) {
      st.patchPet({ [drop.slot]: drop.id } as Partial<typeof pet>);
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
      {item && drop ? (
        <View style={[styles.gift, { backgroundColor: colors.fill }]}>
          <Animated.View
            entering={reduceMotion ? FadeIn.duration(duration.quick) : ZoomIn.springify().damping(spring.pop.damping).stiffness(spring.pop.stiffness).delay(180).withInitialValues({ transform: [{ scale: scale.burstFrom }] })}
            accessible={false}
            style={styles.swatchBox}>
            {drop.slot === 'hat' ? (
              <Pet size={40} color={look.color} hat={drop.id as HatId} face={look.face} stage={look.stage} mood="happy" still />
            ) : drop.slot === 'room' ? (
              <LinearGradient colors={roomGradients[drop.id as Exclude<RoomId, 'auto'>]} style={[styles.swatch, { borderColor: colors.card }]} />
            ) : (
              <View style={[styles.swatch, { backgroundColor: petColors[drop.id as PetColor], borderColor: colors.card }]} />
            )}
          </Animated.View>
          <View style={styles.flex}>
            <Text variant="caption" tone="ink2">{w.gift[drop.slot]}</Text>
            <Text variant="bodyBold">{item.name}</Text>
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
  swatchBox: { width: 76, height: 80, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: space.s },
  btn: { flex: 1, minHeight: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
