import { BlurView } from 'expo-blur';
import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';
import { backOrHome } from '@/lib/nav';

const BAR = 44;

/**
 * Apple large-title screen. The big title scrolls with the content; once it passes under the
 * status bar, a material bar fades in with the small inline title (a scroll-edge effect, not a
 * hard divider). Pushed screens get the iOS 26 glass back button. Room for the floating tab bar.
 */
export function Screen({
  title,
  eyebrow,
  right,
  back = false,
  overlay,
  children,
}: PropsWithChildren<{
  title?: string;
  /** small line above the large title (date, greeting) */
  eyebrow?: string;
  /** accessory on the title row (a glass button, a chip) */
  right?: ReactNode;
  /** pushed screen: show the back button, no tab bar padding */
  back?: boolean;
  /** drawn above the scroll view in window coordinates (drag previews) */
  overlay?: ReactNode;
}>) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });
  const top = insets.top + (back ? BAR : space.s);
  const titleAt = back ? 8 : 40;

  const barStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.get(), [titleAt, titleAt + 24], [0, 1], 'clamp') }));
  const smallTitle = useAnimatedStyle(() => ({
    opacity: interpolate(y.get(), [titleAt + 10, titleAt + 30], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(y.get(), [titleAt + 10, titleAt + 30], [4, 0], 'clamp') }],
  }));

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[styles.content, { paddingTop: top, paddingBottom: insets.bottom + (back ? space.xxl : 110) }]}>
        {title ? (
          <View style={styles.titleRow}>
            <View style={styles.flex}>
              {eyebrow ? (
                <Text variant="caption" tone="ink2" style={styles.eyebrow}>
                  {eyebrow}
                </Text>
              ) : null}
              <Text variant="title" accessibilityRole="header">
                {title}
              </Text>
            </View>
            {right}
          </View>
        ) : null}
        {children}
      </Animated.ScrollView>

      {/* scroll-edge material + inline title */}
      <View pointerEvents="box-none" style={[styles.bar, { height: insets.top + BAR }]}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, barStyle]}>
          {Platform.OS === 'android' ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
          ) : (
            <BlurView intensity={80} tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'} style={StyleSheet.absoluteFill} />
          )}
          <View style={[styles.hairline, { backgroundColor: colors.line }]} />
        </Animated.View>
        <View pointerEvents="box-none" style={[styles.barRow, { marginTop: insets.top }]}>
          {back ? (
            <PressScale
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={6}
              onPress={backOrHome}>
              <Glass interactive radius={22} style={styles.backBtn}>
                <Icon name="back" size={20} weight="semibold" color={colors.ink} />
              </Glass>
            </PressScale>
          ) : null}
          {title ? (
            <Animated.View pointerEvents="none" style={[styles.smallTitle, smallTitle]}>
              <Text variant="bodyBold" numberOfLines={1}>
                {title}
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </View>
      {overlay ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {overlay}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.gutter, gap: space.xl },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.m, paddingHorizontal: space.xs, marginBottom: -space.s },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 0.4 },
  bar: { position: 'absolute', top: 0, start: 0, end: 0 },
  hairline: { position: 'absolute', start: 0, end: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  barRow: { height: BAR, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.l },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  smallTitle: { position: 'absolute', start: 72, end: 72, alignItems: 'center' },
});
