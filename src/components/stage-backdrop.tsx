import { LinearGradient } from 'expo-linear-gradient';
import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import type { RoomId } from '@/features/closet/items';
import { useTheme } from '@/theme/theme-provider';
import { roomGradients, stages } from '@/theme/tokens';

export type Sky = 'morning' | 'day' | 'night';
export const skyOf = (hour: number): Sky => (hour < 6 || hour >= 19 ? 'night' : hour < 11 ? 'morning' : 'day');

/** True when the stage is dark enough that text and glass on it should be light. */
export function stageIsDark(room: RoomId, sky: Sky, scheme: 'light' | 'dark') {
  if (room === 'auto') return scheme === 'dark';
  return room === 'galaxy';
}

/** The pet's stage background: time of day or the Closet room, + a soft floor light on light stages only (no glow in dark: docs/16 #2). */
export function StageBackdrop({ room, sky, glowY = 72 }: { room: RoomId; sky: Sky; glowY?: number }) {
  const { colors, scheme } = useTheme();
  const grad = room === 'auto' ? stages[scheme][sky] : roomGradients[room];
  const dark = stageIsDark(room, sky, scheme);
  const gid = `sg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <>
      <LinearGradient colors={grad} style={StyleSheet.absoluteFill} />
      {dark ? null : (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id={gid} cx="50%" cy={`${glowY}%`} r="50%">
              <Stop offset="0" stopColor={colors.onFocus} stopOpacity={0.7} />
              <Stop offset="1" stopColor={colors.onFocus} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy={glowY} r="50" fill={`url(#${gid})`} />
        </Svg>
      )}
    </>
  );
}
