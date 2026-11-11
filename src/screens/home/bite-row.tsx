import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { Text } from '@/components/text';
import { FOOD } from '@/features/bites/logic';
import { en } from '@/i18n/en';
import type { Bite } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

import { HoldBite } from './feed-drag';
import { useBiteFocus } from './focus-context';
import { BiteIcon } from '@/components/bite-icon';
import { biteIcon } from '@/features/bites/bite-icon';
import { clockLabel } from '@/components/when-picker';
import { clockOf } from '@/features/bites/when';
import { useAppStore } from '@/state/app-store';

const h = en.home;

export type BiteActions = {
  onOpen: () => void;
  onFirst: () => void;
  /** undefined: the bite already waits for later, so there is no "Later" */
  onLater?: () => void;
  onRemove: () => void;
};

/**
 * One bite in the plate list. Tap → start sheet. Hold → focus mode (lift + menu, bite-focus.tsx);
 * hold and move → drag-to-feed. No swipe here: scrolling the list can never delete a bite
 * (docs/16 point 6). Screen readers get the same four actions as the menu.
 */
export function BiteRow({ bite, tag, onOpen, onFirst, onLater, onRemove }: { bite: Bite; /** "Tomorrow", "This week"… for bites in Later */ tag?: string } & BiteActions) {
  const focus = useBiteFocus();
  const lifted = focus?.liftedId === bite.id;
  const rowRef = useAnimatedRef<Animated.View>();
  const food = FOOD[bite.size];
  const meta = useMeta(bite, tag);

  const actions = [
    { name: 'start', label: h.actStart },
    { name: 'first', label: h.actFirst },
    ...(onLater ? [{ name: 'later', label: h.actLater }] : []),
    { name: 'remove', label: h.actRemove },
  ];

  return (
    <HoldBite id={bite.id} emoji={biteIcon(bite.text, bite.size)} rowRef={rowRef}>
      {/* the lifted copy sits exactly on top while focus mode is open; this one hides under it */}
      <Animated.View ref={rowRef} collapsable={false} style={lifted ? styles.hidden : undefined}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${bite.text}. ${meta ? `${meta}. ` : ''}${food.label}, about ${food.min} minutes`}
          accessibilityHint={h.holdHint}
          accessibilityActions={actions}
          onAccessibilityAction={(e) => {
            const a = e.nativeEvent.actionName;
            if (a === 'start') onOpen();
            else if (a === 'first') onFirst();
            else if (a === 'later') onLater?.();
            else if (a === 'remove') onRemove();
          }}
          onPress={() => {
            // a hold already opened focus mode for this bite: the release is not a tap
            if (lifted) return;
            onOpen();
          }}>
          {({ pressed }) => <BiteRowBody bite={bite} tag={tag} pressed={pressed} />}
        </Pressable>
      </Animated.View>
    </HoldBite>
  );
}

function useMeta(bite: Bite, tag?: string) {
  const clock24h = useAppStore((s) => s.settings.clock24h);
  const time = bite.at ? clockLabel(clockOf(bite.at), clock24h) : null;
  return [tag, time].filter(Boolean).join(' · ');
}

/** What a bite row looks like; also drawn as the lifted copy in focus mode (`lifted`). */
export function BiteRowBody({ bite, tag, pressed = false, lifted = false }: { bite: Bite; tag?: string; pressed?: boolean; lifted?: boolean }) {
  const { colors } = useTheme();
  const meta = useMeta(bite, tag);
  const food = FOOD[bite.size];
  return (
    <View style={[styles.bite, { backgroundColor: lifted ? colors.cardSolid : pressed ? colors.cardAlt : colors.card }]}>
      <View style={[styles.food, { backgroundColor: colors.fill }]}>
        <BiteIcon text={bite.text} size={bite.size} />
      </View>
      <View style={[styles.body, lifted ? null : { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.flex}>
          <Text variant="body" numberOfLines={2}>{bite.text}</Text>
          <Text variant="caption" tone="ink2">
            {meta ? <Text variant="caption" tone="primary" style={styles.meta}>{meta} · </Text> : null}
            {h.about(food.min)}
          </Text>
        </View>
        {bite.daily ? (
          <View style={styles.daily} accessibilityLabel={h.dailyOn}>
            <Icon name="repeat" size={13} weight="bold" color={colors.primaryInk} />
          </View>
        ) : null}
        <View style={[styles.go, { backgroundColor: colors.fill }]}>
          <Icon name="play" size={12} weight="bold" color={colors.ink2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hidden: { opacity: 0 },
  meta: { fontWeight: '600' },
  bite: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingStart: space.m },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 64, paddingVertical: space.s + 2, paddingEnd: space.l },
  food: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  go: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  daily: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
