import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme-provider';

/**
 * The ambient background behind every screen: a soft vertical gradient and two big, blurred
 * glows (pink top-right, violet left). Static on purpose (no looping motion behind content,
 * HIG motion + performance). Glass cards sit on top of it, so dark mode has depth, not flat black.
 */
export const Backdrop = memo(function Backdrop() {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[colors.bgTop, colors.bg, colors.bgBottom]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="bdA" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowA} />
            <Stop offset="1" stopColor={colors.glowA} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bdB" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.glowB} />
            <Stop offset="1" stopColor={colors.glowB} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={92} cy={18} rx={62} ry={48} fill="url(#bdA)" />
        <Ellipse cx={4} cy={96} rx={58} ry={56} fill="url(#bdB)" />
        <Ellipse cx={96} cy={182} rx={50} ry={40} fill="url(#bdA)" opacity={0.6} />
      </Svg>
    </View>
  );
});
