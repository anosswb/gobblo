import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { Toggle } from '@/components/toggle';
import { en } from '@/i18n/en';
import type { Bite } from '@/state/schema';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';
import { BiteIcon } from './bite-icon';

const s = en.start;
type Choice = { minutes: number; mode: '2min' | '15' | '25' | 'custom'; label: string };

/**
 * Start sheet (docs/01 §2), iOS 26 style: a floating sheet inset from the screen edges with
 * large continuous corners. One prominent action (the 2-minute trick), the other lengths as
 * quiet capsules, then the daily switch and a destructive text button. Opens on the iOS sheet
 * curve (500 ms), closes faster (350 ms). Reduce Motion: fades.
 */
export function StartSheet({
  bite,
  defaultTimer,
  onClose,
  onStart,
  onRemove,
  onToggleDaily,
}: {
  bite: Bite | null;
  defaultTimer: number;
  onClose: () => void;
  onStart: (minutes: number, mode: Choice['mode']) => void;
  onRemove: () => void;
  onToggleDaily: () => void;
}) {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const more: Choice[] = [
    { minutes: 5, mode: 'custom', label: s.five },
    { minutes: 15, mode: '15', label: s.fifteen },
    { minutes: 25, mode: '25', label: s.twentyFive },
  ];

  const enterSheet = reduceMotion ? FadeIn.duration(duration.quick) : SlideInDown.duration(duration.verySlow).easing(easing.sheet);
  const exitSheet = reduceMotion ? FadeOut.duration(duration.quick) : SlideOutDown.duration(duration.medium).easing(easing.sheet);

  return (
    <Modal visible={!!bite} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      {bite && (
        <View style={styles.fill}>
          <Animated.View entering={FadeIn.duration(duration.slow)} exiting={FadeOut.duration(duration.fast)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.fill} onPress={onClose} />
          </Animated.View>
          <Animated.View
            entering={enterSheet}
            exiting={exitSheet}
            style={[styles.sheet, { backgroundColor: colors.cardSolid, bottom: Math.max(insets.bottom, space.s), shadowColor: colors.shadow }]}>
            <View style={[styles.grabber, { backgroundColor: colors.fill2 }]} />

            <View style={styles.head}>
              <View style={[styles.food, { backgroundColor: colors.fill }]}>
                <BiteIcon text={bite.text} size={bite.size} px={30} />
              </View>
              <View style={styles.flex}>
                <Text variant="caption" tone="ink2">{s.title}</Text>
                <Text variant="title2" numberOfLines={2}>{bite.text}</Text>
              </View>
              <PressScale accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} onPress={onClose} style={[styles.close, { backgroundColor: colors.fill }]}>
                <Icon name="close" size={14} weight="bold" color={colors.ink2} />
              </PressScale>
            </View>

            <PressScale
              accessibilityRole="button"
              accessibilityLabel={`${s.trick}. ${s.trickSub}`}
              onPress={() => onStart(2, '2min')}
              style={[styles.primary, { backgroundColor: colors.primary }]}>
              <Text variant="bodyBold" tone="onPrimary">{s.trick}</Text>
              <Text variant="caption" style={[styles.primarySub, { color: colors.onPrimary }]}>{s.trickSub}</Text>
            </PressScale>

            <View style={styles.row}>
              {more.map((c) => {
                const def = c.minutes === defaultTimer;
                return (
                  <PressScale
                    key={c.label}
                    accessibilityRole="button"
                    accessibilityLabel={c.label}
                    onPress={() => onStart(c.minutes, c.mode)}
                    style={[styles.more, { backgroundColor: def ? colors.primarySoft : colors.fill }]}>
                    <Text variant="bodyBold" tone={def ? 'primary' : 'ink'}>{c.label}</Text>
                  </PressScale>
                );
              })}
            </View>

            <View style={[styles.group, { backgroundColor: colors.cardAlt }]}>
              <View style={styles.groupRow}>
                <Icon name="repeat" size={18} color={colors.ink2} />
                <Text variant="body" style={styles.flex}>{s.keepDaily}</Text>
                <Toggle value={!!bite.daily} onChange={onToggleDaily} accessibilityLabel={s.keepDaily} />
              </View>
            </View>

            <PressScale accessibilityRole="button" onPress={onRemove} style={styles.remove}>
              <Text variant="bodyBold" tone="danger">{s.remove}</Text>
            </PressScale>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  sheet: {
    position: 'absolute',
    start: space.s,
    end: space.s,
    borderRadius: radius.sheet,
    paddingHorizontal: space.xl,
    paddingTop: space.s,
    paddingBottom: space.l,
    gap: space.m,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, marginBottom: space.s },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.xs },
  food: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30, lineHeight: 36 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  primary: { minHeight: 60, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingVertical: space.s },
  primarySub: { opacity: 0.8 },
  row: { flexDirection: 'row', gap: space.s },
  more: { flex: 1, minHeight: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  group: { borderRadius: radius.row + 6, paddingHorizontal: space.l },
  groupRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: space.m },
  remove: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
