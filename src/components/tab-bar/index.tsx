import { router, usePathname } from 'expo-router';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { useEffect, useRef, useState, type Ref } from 'react';
import { Pressable, StyleSheet, View, type HostInstance, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { en } from '@/i18n/en';
import { duration, easing, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

type TabName = 'index' | 'closet' | 'me';
type TabDef = { name: TabName; label: string; icon: IconName };

const TABS: TabDef[] = [
  { name: 'index', label: en.tabs.home, icon: 'home' },
  { name: 'closet', label: en.tabs.closet, icon: 'closet' },
  { name: 'me', label: en.tabs.me, icon: 'me' },
];
const BAR_H = 62;
const PAD = 4;

function activeIndex(pathname: string): number {
  if (pathname.startsWith('/closet')) return 1;
  if (pathname.startsWith('/me')) return 2;
  return 0;
}

/**
 * iOS 26 tab bar: a floating Liquid Glass capsule with the tabs, and the primary action
 * (brain dump) as its own tinted glass circle beside it, the way Apple splits out Search.
 * Content scrolls under it. Switching tabs never slides content (tabs are peers); only the
 * selection lens moves, on a near-critically-damped spring so it can be interrupted.
 */
export function TabBar() {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const index = activeIndex(usePathname());
  const [w, setW] = useState(0);
  const tabW = (w - PAD * 2) / TABS.length;
  const x = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (!tabW) return;
    const to = PAD + index * tabW;
    if (!placed.current || reduceMotion) {
      placed.current = true;
      x.set(to);
      return;
    }
    x.set(withSpring(to, spring.lens));
  }, [index, tabW, reduceMotion, x]);

  const lens = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom - 6, space.m) }]}>
      <Glass interactive radius={BAR_H / 2} style={styles.bar}>
        <View style={styles.row} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
          {tabW > 0 && (
            <Animated.View pointerEvents="none" style={[styles.lens, { width: tabW, backgroundColor: colors.fill }, lens]} />
          )}
          {TABS.map((t) => (
            <TabTrigger key={t.name} name={t.name} asChild>
              <TabButton def={t} />
            </TabTrigger>
          ))}
        </View>
      </Glass>
      <DumpButton />
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { def: TabDef };

function TabButton({ def, isFocused, onPress, ref, ...rest }: TabButtonProps) {
  const { colors } = useTheme();
  const tint = isFocused ? colors.primary : colors.ink;
  return (
    <Pressable
      {...rest}
      ref={ref as Ref<HostInstance>}
      onPress={(e) => {
        if (!isFocused) haptics.select();
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={en.a11y.tab(def.label)}
      style={styles.tab}>
      <Icon name={def.icon} size={22} color={tint} />
      <Text variant="label" style={[styles.label, { color: tint }]} numberOfLines={1}>
        {def.label}
      </Text>
    </Pressable>
  );
}

function DumpButton() {
  const { colors, reduceMotion } = useTheme();
  const turn = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={en.a11y.dumpButton}
      pressedScale={0.92}
      onPressIn={() => {
        if (!reduceMotion) turn.set(withTiming(90, { duration: duration.quick, easing: easing.strongOut }));
      }}
      onPressOut={() => {
        turn.set(reduceMotion ? 0 : withSpring(0, spring.apple));
      }}
      onPress={() => {
        haptics.light();
        router.push('/dump');
      }}>
      <Glass interactive tint={colors.primary} radius={BAR_H / 2} style={styles.fab}>
        <Animated.View style={style}>
          <Icon name="plus" size={26} weight="bold" color={colors.onPrimary} />
        </Animated.View>
      </Glass>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', start: space.l, end: space.l, flexDirection: 'row', alignItems: 'center', gap: space.s + 2 },
  bar: { flex: 1, height: BAR_H },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: PAD, alignItems: 'center' },
  lens: { position: 'absolute', top: PAD, bottom: PAD, start: 0, borderRadius: (BAR_H - PAD * 2) / 2 },
  tab: { flex: 1, height: BAR_H - PAD * 2, alignItems: 'center', justifyContent: 'center', gap: 1 },
  label: { fontSize: 10, lineHeight: 13 },
  fab: { width: BAR_H, height: BAR_H, alignItems: 'center', justifyContent: 'center' },
});
