import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme-provider';

const LIQUID = Platform.OS === 'ios' && isLiquidGlassAvailable();

/**
 * One material for every floating layer (tab bar, toasts, chips over the stage).
 * - iOS 26+: real Liquid Glass (UIGlassEffect), interactive when it's a control.
 * - older iOS + web: system chrome blur + a bright top edge.
 * - Android: no cheap live blur without a blur target, so a frosted translucent fill with the
 *   same bright edge and shadow. Reads as the same object.
 * Never stack glass on glass (legibility collapses). Text on glass uses ink, never ink3.
 */
export function Glass({
  children,
  style,
  radius = 999,
  interactive = false,
  tint,
  shadow = true,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  radius?: number;
  interactive?: boolean;
  /** tinted glass (the + button) */
  tint?: string;
  shadow?: boolean;
}>) {
  const { colors, scheme } = useTheme();

  if (LIQUID) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive={interactive}
        tintColor={tint}
        colorScheme={scheme}
        style={[{ borderRadius: radius }, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        { borderRadius: radius },
        styles.stack,
        shadow && [styles.shadow, { shadowColor: colors.shadow }],
        style,
      ]}>
      <View style={[StyleSheet.absoluteFill, styles.under, { borderRadius: radius, overflow: 'hidden' }]} pointerEvents="none">
        {Platform.OS !== 'android' && !tint ? (
          <BlurView
            intensity={60}
            tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tint ?? colors.glass }]} />
        {/* specular sheen: light catching the top of the material (reads as glass without live blur) */}
        <LinearGradient
          colors={[colors.glassBorder, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          style={[StyleSheet.absoluteFill, { opacity: tint ? 0.35 : 0.28 }]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.edge,
            { borderRadius: radius, borderColor: colors.glassBorder, borderBottomColor: colors.glassEdge },
          ]}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { shadowOpacity: 1, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  edge: { borderWidth: StyleSheet.hairlineWidth * 2 },
  // the material sits under the content on every platform (web paints positioned layers over bare SVG icons otherwise)
  stack: { zIndex: 0 },
  under: { zIndex: -1 },
});
