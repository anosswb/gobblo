import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme-provider';

/**
 * The background behind every screen: a pure, very soft vertical tone (bgTop → bg → bgBottom),
 * nearly flat in dark. No glows (docs/16 #2): depth comes from card edges and soft shadows.
 * Static on purpose (no looping motion behind content, HIG motion + performance).
 */
export const Backdrop = memo(function Backdrop() {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[colors.bgTop, colors.bg, colors.bgBottom]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
    </View>
  );
});
