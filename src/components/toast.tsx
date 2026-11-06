import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

/**
 * Stacking toasts from Screenrove's Sonner spec: enter 400 ms ease, exit faster (350 ms),
 * max 3, each older toast lifts 14 px and shrinks 5 %, auto-hide 4 s, tap to dismiss.
 * Reduce Motion: 150 ms fades.
 */
type ToastItem = { id: number; text: string; action?: { label: string; onPress: () => void } };
type ToastStore = { items: ToastItem[]; show: (t: Omit<ToastItem, 'id'>) => void; hide: (id: number) => void };

let next = 1;
const useToasts = create<ToastStore>((set) => ({
  items: [],
  show: (t) => set((s) => ({ items: [{ ...t, id: next++ }, ...s.items].slice(0, 3) })),
  hide: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

export const toast = (text: string, action?: ToastItem['action']) => useToasts.getState().show({ text, action });

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1); // CSS "ease" (Sonner)

export function ToastHost() {
  const items = useToasts((s) => s.items);
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {items.map((t, i) => (
        <ToastView key={t.id} item={t} index={i} />
      ))}
    </View>
  );
}

function ToastView({ item, index }: { item: ToastItem; index: number }) {
  const { colors, scheme, reduceMotion } = useTheme();
  const hide = useToasts((s) => s.hide);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => hide(item.id), 4000);
    return () => clearTimeout(t);
  }, [hide, item.id]);

  const entering = reduceMotion ? FadeIn.duration(duration.quick) : SlideInUp.duration(400).easing(EASE);
  const exiting = reduceMotion ? FadeOut.duration(duration.quick) : SlideOutUp.duration(duration.medium).easing(EASE);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      layout={reduceMotion ? undefined : LinearTransition.duration(400).easing(EASE)}
      style={[
        styles.wrap,
        {
          top: insets.top + space.s,
          zIndex: 10 - index,
          transform: [{ translateY: index * 14 }, { scale: 1 - index * 0.05 }],
          opacity: index === 0 ? 1 : 0.9,
        },
      ]}>
      <PressScale
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={() => hide(item.id)}
        style={[styles.toast, { backgroundColor: scheme === 'dark' ? colors.cardAlt : colors.ink, shadowColor: colors.shadow }]}>
        <Text variant="bodyBold" style={[styles.text, { color: scheme === 'dark' ? colors.ink : colors.bg }]}>
          {item.text}
        </Text>
        {item.action ? (
          <PressScale
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => {
              item.action?.onPress();
              hide(item.id);
            }}>
            <Text variant="bodyBold" style={{ color: colors.reward }}>
              {item.action.label}
            </Text>
          </PressScale>
        ) : null}
      </PressScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', start: space.gutter, end: space.gutter },
  toast: {
    marginTop: space.s,
    borderRadius: radius.button,
    paddingVertical: space.m,
    paddingHorizontal: space.l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  text: { flex: 1 },
});
