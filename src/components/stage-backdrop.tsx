import { useIsFocused } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import type { RoomId } from '@/features/closet/items';
import { useAppActive } from '@/hooks/use-app-active';
import { useTheme } from '@/theme/theme-provider';
import { roomGradients, stageLook, type StageLook } from '@/theme/tokens';

export type Sky = 'morning' | 'day' | 'night';
export const skyOf = (hour: number): Sky => (hour < 6 || hour >= 19 ? 'night' : hour < 11 ? 'morning' : 'day');

/** True when the stage is dark enough that text and glass on it should be light. */
export function stageIsDark(room: RoomId, sky: Sky, scheme: 'light' | 'dark') {
  if (room === 'auto') return scheme === 'dark';
  return room === 'galaxy';
}

/** The stage colours for the current look (theme tint, or the Closet room) and its water. */
export function useStageLook(room: RoomId, sky: Sky): StageLook {
  const { colors, scheme } = useTheme();
  return stageLook(colors, scheme, sky, room === 'auto' ? undefined : roomGradients[room]);
}

/** The pet's stage background: a soft tint of the theme (or the Closet room), + a soft floor light on light stages only (no glow in dark: docs/16 #2). */
export function StageBackdrop({ room, sky, glowY = 72 }: { room: RoomId; sky: Sky; glowY?: number }) {
  const { colors, scheme } = useTheme();
  const look = useStageLook(room, sky);
  const dark = stageIsDark(room, sky, scheme);
  const gid = `sg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <>
      <LinearGradient colors={look.gradient} style={StyleSheet.absoluteFill} />
      {dark ? null : (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id={gid} cx="50%" cy={`${glowY}%`} r="50%">
              <Stop offset="0" stopColor={colors.onFocus} stopOpacity={0.55} />
              <Stop offset="1" stopColor={colors.onFocus} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy={glowY} r="50" fill={`url(#${gid})`} />
        </Svg>
      )}
    </>
  );
}

/** Share of the box height that is water (the otter's home line). */
export const WATER_SHARE = 0.18;
/** Half the wave height of the water's top edge, in pt (crest to trough = 2×). */
export const WAVE_PT = 3;
/** One slow drift of the wave across one period (very calm). */
export const WAVE_DRIFT_MS = 9000;

// one period = 100 units; the path holds 6 periods so it can slide by one period seamlessly
const PERIOD = 100;
const wavePath = (h: number) => {
  const a = WAVE_PT;
  let d = `M0 ${a}`;
  for (let i = 0; i < 6; i++) {
    const x = i * PERIOD;
    d += ` C${x + 25} 0 ${x + 25} 0 ${x + 50} ${a} S${x + 75} ${a * 2} ${x + 100} ${a}`;
  }
  let ripples = '';
  for (let i = 0; i < 6; i++) {
    const x = i * PERIOD;
    const y1 = a * 2 + h * 0.38;
    const y2 = a * 2 + h * 0.68;
    ripples += ` M${x + 14} ${y1} h22 M${x + 62} ${y2} h14`;
  }
  return { fill: `${d} V${h + a} H0Z`, crest: d, ripples };
};

/**
 * Calm water across the bottom of the stage, drawn in front of the pet so its feet sit just
 * under the line. One gentle wavy edge that drifts very slowly; still under Reduce Motion and
 * paused off-screen or in the background, like the other idle loops.
 */
export function StageWater({ height, width, look }: { height: number; width: number; look: StageLook }) {
  const { reduceMotion } = useTheme();
  const focused = useIsFocused();
  const active = useAppActive();
  const live = !reduceMotion && focused && active && width > 0;
  const gid = `sw${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const drift = useSharedValue(0);
  // 3 periods fill the box width; the svg holds 6 and slides by one period
  const unit = width / (PERIOD * 3);
  useEffect(() => {
    if (!live) {
      cancelAnimation(drift);
      return;
    }
    drift.set(0);
    drift.set(withRepeat(withTiming(1, { duration: WAVE_DRIFT_MS, easing: Easing.linear }), -1));
  }, [live, drift]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: -drift.get() * PERIOD * unit }] }));
  const p = wavePath(height);
  return (
    <View pointerEvents="none" style={[styles.water, { height: height + WAVE_PT }]}>
      <Animated.View style={[{ width: width * 2, height: height + WAVE_PT }, style]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${PERIOD * 6} ${height + WAVE_PT}`} preserveAspectRatio="none">
          <Defs>
            <SvgGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={look.water} />
              <Stop offset="1" stopColor={look.waterDeep} />
            </SvgGradient>
          </Defs>
          <Path d={p.fill} fill={`url(#${gid})`} />
          <Path d={p.crest} fill="none" stroke={look.crest} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {/* a few soft ripple dashes, one per period, so it reads as water and not as a floor */}
          <Path d={p.ripples} fill="none" stroke={look.crest} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} vectorEffect="non-scaling-stroke" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  water: { position: 'absolute', start: 0, end: 0, bottom: 0, overflow: 'hidden' },
});
