import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import type { Slice } from '@/features/spin/logic';
import { useTheme } from '@/theme/theme-provider';
import { wheelColors } from '@/theme/tokens';

/** Point on the circle, angle measured clockwise from the top (degrees). */
const at = (cx: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cx - r * Math.cos(a) };
};

function slicePath(c: number, r: number, from: number, to: number) {
  const p0 = at(c, r, from);
  const p1 = at(c, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M${c} ${c} L${p0.x} ${p0.y} A${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y} Z`;
}

/** The wheel itself. Rotation is a shared value so it spins on the UI thread. */
export function Wheel({ slices, size, rotation }: { slices: Slice[]; size: number; rotation: SharedValue<number> }) {
  const { colors } = useTheme();
  const c = size / 2;
  const r = c - 6;
  const step = 360 / slices.length;
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, spin]}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={c - 1} fill={colors.card} stroke={colors.line} strokeWidth={2} />
        {slices.map((s, i) => {
          const mid = at(c, r * 0.68, i * step + step / 2);
          return (
            <G key={s.key}>
              <Path d={slicePath(c, r, i * step, (i + 1) * step)} fill={wheelColors[i % wheelColors.length]} stroke={colors.card} strokeWidth={3} />
              <G transform={`rotate(${i * step + step / 2} ${mid.x} ${mid.y})`}>
                <SvgText x={mid.x} y={mid.y + size * 0.035} fontSize={size * 0.1} textAnchor="middle">
                  {s.emoji}
                </SvgText>
              </G>
            </G>
          );
        })}
        <Circle cx={c} cy={c} r={size * 0.11} fill={colors.card} stroke={colors.line} strokeWidth={2} />
      </Svg>
    </Animated.View>
  );
}
