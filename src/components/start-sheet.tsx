import { ArrowsClockwise, Trash } from 'phosphor-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { FOOD } from '@/features/bites/logic';
import { en } from '@/i18n/en';
import type { Bite } from '@/state/schema';
import { duration, easing } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const s = en.start;
type Choice = { minutes: number; mode: '2min' | '15' | '25' | 'custom'; label: string; sub?: string };

/**
 * Start sheet (docs/01 §2). Opens on the Vaul iOS sheet curve (500 ms), closes faster (350 ms).
 * 2 min "the trick" is always first and highlighted. Phase 3 adds chop + the page scale behind.
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
  const choices: Choice[] = [
    { minutes: 2, mode: '2min', label: s.trick, sub: s.trickSub },
    { minutes: 5, mode: 'custom', label: s.five },
    { minutes: 15, mode: '15', label: s.fifteen },
    { minutes: 25, mode: '25', label: s.twentyFive },
  ];

  const enterSheet = reduceMotion ? FadeIn.duration(duration.quick) : SlideInDown.duration(duration.verySlow).easing(easing.sheet);
  const exitSheet = reduceMotion ? FadeOut.duration(duration.quick) : SlideOutDown.duration(duration.medium).easing(easing.sheet);

  return (
    <Modal visible={!!bite} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {bite && (
        <View style={styles.fill}>
          <Animated.View entering={FadeIn.duration(duration.verySlow)} exiting={FadeOut.duration(duration.medium)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.fill} onPress={onClose} />
          </Animated.View>
          <Animated.View entering={enterSheet} exiting={exitSheet} style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + space.l }]}>
            <View style={[styles.grabber, { backgroundColor: colors.line }]} />
            <View style={styles.head}>
              <Text style={styles.emoji}>{FOOD[bite.size].emoji}</Text>
              <View style={styles.flex}>
                <Text variant="caption" tone="ink3">{s.title}</Text>
                <Text variant="heading" numberOfLines={2}>{bite.text}</Text>
              </View>
            </View>
            {choices.map((c) => {
              const highlighted = c.mode === '2min' || c.minutes === defaultTimer;
              const trick = c.mode === '2min';
              return (
                <PressScale
                  key={c.label}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.label}${c.sub ? `. ${c.sub}` : ''}`}
                  onPress={() => onStart(c.minutes, c.mode)}
                  style={[
                    styles.option,
                    trick
                      ? { backgroundColor: colors.reward, borderBottomColor: colors.rewardDeep, borderBottomWidth: 5 }
                      : { backgroundColor: highlighted ? colors.cardAlt : colors.card, borderColor: colors.line, borderWidth: 1.5 },
                  ]}>
                  <Text variant="heading" tone={trick ? 'onReward' : 'ink'}>{c.label}</Text>
                  {c.sub ? <Text variant="caption" tone="onReward">{c.sub}</Text> : null}
                </PressScale>
              );
            })}
            <View style={styles.row}>
              <PressScale accessibilityRole="button" onPress={onToggleDaily} style={[styles.small, { backgroundColor: bite.daily ? colors.cardAlt : 'transparent' }]}>
                <ArrowsClockwise size={18} weight="bold" color={bite.daily ? colors.primary : colors.ink2} />
                <Text variant="caption" tone={bite.daily ? 'primary' : 'ink2'}>{s.keepDaily}{bite.daily ? ' ✓' : ''}</Text>
              </PressScale>
              <PressScale accessibilityRole="button" onPress={onRemove} style={styles.small}>
                <Trash size={18} weight="bold" color={colors.ink3} />
                <Text variant="caption" tone="ink3">{s.remove}</Text>
              </PressScale>
            </View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  sheet: { position: 'absolute', start: 0, end: 0, bottom: 0, borderTopStartRadius: radius.sheet, borderTopEndRadius: radius.sheet, padding: space.xl, gap: space.m },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: space.s },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.s },
  emoji: { fontSize: 40, lineHeight: 48 },
  option: { minHeight: 60, borderRadius: radius.button, paddingHorizontal: space.l, paddingVertical: space.m, justifyContent: 'center', gap: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.m, borderRadius: radius.chip },
});
