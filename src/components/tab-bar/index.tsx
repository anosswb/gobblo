import { router, usePathname } from 'expo-router';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { House, Plus, Shuffle, Smiley, TShirt, type IconProps } from 'phosphor-react-native';
import { useEffect, useState, type ComponentType, type Ref } from 'react';
import { StyleSheet, View, type HostInstance, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { en } from '@/i18n/en';
import { duration, easing, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

type TabName = 'index' | 'spin' | 'closet' | 'me';
type TabDef = { name: TabName; label: string; Icon: ComponentType<IconProps>; slot: number };

/** 5 slots: home, spin, [dump FAB], closet, me */
const TABS: TabDef[] = [
  { name: 'index', label: en.tabs.home, Icon: House, slot: 0 },
  { name: 'spin', label: en.tabs.spin, Icon: Shuffle, slot: 1 },
  { name: 'closet', label: en.tabs.closet, Icon: TShirt, slot: 3 },
  { name: 'me', label: en.tabs.me, Icon: Smiley, slot: 4 },
];
const SLOTS = 5;
const BAR_HEIGHT = 64;
const PLATEAU_INSET = 10;

function activeSlot(pathname: string): number {
  if (pathname.startsWith('/spin')) return 1;
  if (pathname.startsWith('/closet')) return 3;
  if (pathname.startsWith('/me')) return 4;
  return 0;
}

/**
 * Custom tab bar: one plateau springs between tabs (Screenrove interior-tabs, 620/42/0.35),
 * the active icon pops, and a raised dump FAB sits in the middle (docs/02).
 */
export function TabBar() {
  const { colors, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const slot = activeSlot(pathname);
  const [width, setWidth] = useState(0);
  const slotW = width / SLOTS;
  const x = useSharedValue(0);

  useEffect(() => {
    if (!slotW) return;
    const to = slot * slotW + PLATEAU_INSET;
    x.set(reduceMotion ? to : withSpring(to, spring.plateau));
  }, [slot, slotW, reduceMotion, x]);

  const plateau = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.bar,
        { backgroundColor: colors.tabBar, borderTopColor: colors.line, paddingBottom: insets.bottom, height: BAR_HEIGHT + insets.bottom },
      ]}>
      {slotW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.plateau, { width: slotW - PLATEAU_INSET * 2, backgroundColor: colors.cardAlt }, plateau]}
        />
      )}
      {TABS.slice(0, 2).map((t) => (
        <TabTrigger key={t.name} name={t.name} asChild>
          <TabButton def={t} />
        </TabTrigger>
      ))}
      <DumpFab />
      {TABS.slice(2).map((t) => (
        <TabTrigger key={t.name} name={t.name} asChild>
          <TabButton def={t} />
        </TabTrigger>
      ))}
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { def: TabDef };

function TabButton({ def, isFocused, onPress, ref, ...rest }: TabButtonProps) {
  const { colors, reduceMotion } = useTheme();
  const pop = useSharedValue(1);

  useEffect(() => {
    if (isFocused && !reduceMotion) pop.set(withSequence(withTiming(0.86, { duration: 0 }), withSpring(1, spring.pop)));
  }, [isFocused, reduceMotion, pop]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const tint = isFocused ? colors.primary : colors.ink3;

  return (
    <PressScale
      {...rest}
      // expo-router types the slot ref as Ref<typeof View>; at runtime it is the host instance.
      ref={ref as Ref<HostInstance>}
      onPress={(e) => {
        if (!isFocused) haptics.select();
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={en.a11y.tab(def.label)}
      style={styles.tab}>
      <Animated.View style={iconStyle}>
        <def.Icon size={26} color={tint} weight={isFocused ? 'fill' : 'bold'} />
      </Animated.View>
      <Text variant="caption" style={{ color: tint }}>
        {def.label}
      </Text>
    </PressScale>
  );
}

function DumpFab() {
  const { colors, reduceMotion } = useTheme();
  const tilt = useSharedValue(-6);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.get()}deg` }] }));

  return (
    <View style={styles.tab}>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={en.a11y.dumpButton}
        hitSlop={8}
        onPressIn={() => {
          tilt.set(reduceMotion ? 0 : withTiming(0, { duration: duration.micro, easing: easing.smoothOut }));
        }}
        onPressOut={() => {
          tilt.set(reduceMotion ? -6 : withSpring(-6, spring.pop));
        }}
        onPress={() => {
          haptics.light();
          router.push('/dump');
        }}>
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep, shadowColor: colors.primary },
            style,
          ]}>
          <Plus size={28} weight="bold" color={colors.onPrimary} />
        </Animated.View>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  plateau: {
    position: 'absolute',
    top: 8,
    height: 48,
    borderRadius: radius.button,
  },
  tab: { flex: 1, height: BAR_HEIGHT, alignItems: 'center', justifyContent: 'center', gap: 2 },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -space.xxl,
    borderBottomWidth: 5,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
