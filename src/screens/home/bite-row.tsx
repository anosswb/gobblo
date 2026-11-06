import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Swipeable, { SwipeDirection, type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { Text } from '@/components/text';
import { FOOD } from '@/features/bites/logic';
import { haptics } from '@/lib/haptics';
import { en } from '@/i18n/en';
import type { Bite } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

const h = en.home;
const ACTION_W = 84;

/**
 * One bite in the plate list, Mail/Reminders style:
 * tap → start sheet; swipe right → start sheet; swipe left (full) → remove with undo.
 * The action icon grows with the drag and a haptic marks the commit point.
 */
export function BiteRow({
  bite,
  onOpen,
  onRemove,
}: {
  bite: Bite;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const ref = useRef<SwipeableMethods>(null);
  const food = FOOD[bite.size];

  return (
    <Swipeable
      ref={ref}
      friction={1.6}
      overshootFriction={8}
      leftThreshold={ACTION_W * 0.7}
      rightThreshold={ACTION_W * 0.7}
      renderLeftActions={(p) => <Action progress={p} side="left" color={colors.success} icon="play" label="start" />}
      renderRightActions={(p) => <Action progress={p} side="right" color={colors.danger} icon="trash" label="remove" />}
      onSwipeableWillOpen={() => haptics.light()}
      onSwipeableOpen={(dir) => {
        // removing: the row leaves with the list's exit animation; don't animate it closed
        // underneath (that would touch a gesture handler that is already gone)
        if (dir === SwipeDirection.LEFT) {
          onRemove();
          return;
        }
        ref.current?.close();
        onOpen();
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${bite.text}. ${food.label}, about ${food.min} minutes. tap to start`}
        accessibilityActions={[{ name: 'delete', label: 'remove' }]}
        onAccessibilityAction={(e) => e.nativeEvent.actionName === 'delete' && onRemove()}
        onPress={onOpen}>
        {({ pressed }) => (
          <View style={[styles.bite, { backgroundColor: pressed ? colors.cardAlt : colors.card }]}>
            <View style={[styles.food, { backgroundColor: colors.fill }]}>
              <Text style={styles.foodEmoji}>{food.emoji}</Text>
            </View>
            <View style={[styles.body, { borderTopColor: colors.line }]}>
              <View style={styles.flex}>
                <Text variant="body" numberOfLines={2}>{bite.text}</Text>
                <Text variant="caption" tone="ink2">
                  {food.label} · ~{food.min} min · +{food.sparks} ✦
                </Text>
              </View>
              {bite.daily ? (
                <View style={styles.daily} accessibilityLabel={h.dailyOn}>
                  <Icon name="repeat" size={13} weight="bold" color={colors.primary} />
                </View>
              ) : null}
              <Icon name="chevron" size={13} weight="bold" color={colors.ink3} />
            </View>
          </View>
        )}
      </Pressable>
    </Swipeable>
  );
}

function Action({ progress, side, color, icon, label }: { progress: SharedValue<number>; side: 'left' | 'right'; color: string; icon: IconName; label: string }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    return { opacity: interpolate(p, [0, 0.4, 1], [0, 0.7, 1], 'clamp'), transform: [{ scale: interpolate(p, [0, 1], [0.7, 1], 'clamp') }] };
  });
  // hidden until a swipe starts, so no colour peeks at the row edges
  const panel = useAnimatedStyle(() => ({ opacity: progress.get() > 0.01 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.action, { backgroundColor: color, alignItems: side === 'left' ? 'flex-start' : 'flex-end' }, panel]}>
      <Animated.View style={[styles.actionInner, style]}>
        <Icon name={icon} size={18} color={colors.onPrimary} />
        <Text variant="label" style={{ color: colors.onPrimary }}>{label}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bite: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingStart: space.m },
  body: { flex: 1, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 64, paddingVertical: space.s + 2, paddingEnd: space.l },
  food: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 22, lineHeight: 28 },
  daily: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  action: { width: ACTION_W, justifyContent: 'center' },
  actionInner: { width: ACTION_W, alignItems: 'center', gap: 2 },
});
