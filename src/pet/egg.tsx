import { useEffect, useId } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme-provider';
import { petColors, type PetColor } from '@/theme/tokens';

import { OTTER_CARAMEL, SparkPebble } from './pet';

/**
 * The egg before hatching: a flat cream egg speckled in the pet's colour (caramel by default),
 * with a tiny spark mark (docs/18) and a soft two-tone shade. `cracks` 0–3 draws the crack
 * stages. Idles with a lazy wobble; Reduce Motion keeps it still. Illustration colours live here
 * on purpose.
 */
const ART = { shell: '#FBEEDD', crack: '#4A2E22', shade: '#000000', spark: '#FFD166' };
const SHELL = 'M100 26 C142 26 168 96 168 142 C168 192 138 222 100 222 C62 222 32 192 32 142 C32 96 58 26 100 26Z';

export function Egg({ size = 180, color, cracks = 0, wobble = true }: { size?: number; color?: PetColor; cracks?: number; wobble?: boolean }) {
  const { reduceMotion } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const c = color ? petColors[color] : OTTER_CARAMEL;
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !wobble) {
      tilt.set(withTiming(0, { duration: 150 }));
      return;
    }
    const e = Easing.inOut(Easing.sin);
    // wobble harder as it cracks
    const amp = 3 + cracks * 2.5;
    const ms = Math.max(160, 700 - cracks * 160);
    tilt.set(withRepeat(withSequence(withTiming(amp, { duration: ms, easing: e }), withTiming(-amp, { duration: ms * 2, easing: e }), withTiming(0, { duration: ms, easing: e })), -1));
  }, [cracks, wobble, reduceMotion, tilt]);

  const style = useAnimatedStyle(() => ({ transformOrigin: 'center bottom', transform: [{ rotate: `${tilt.get()}deg` }] }));

  return (
    <Animated.View style={[{ width: size, height: size * 1.2 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 200 240">
        <Defs>
          <ClipPath id={`s${uid}`}>
            <Path d={SHELL} />
          </ClipPath>
        </Defs>
        <Ellipse cx={100} cy={229} rx={56} ry={7} fill={ART.shade} opacity={0.12} />
        <Path d={SHELL} fill={ART.shell} />
        <G clipPath={`url(#s${uid})`}>
          {/* flat two-tone shade on the right side */}
          <Ellipse cx={150} cy={150} rx={44} ry={100} fill={c} opacity={0.14} />
          {/* speckles in the pet's colour */}
          <Ellipse cx={128} cy={96} rx={11} ry={8} fill={c} transform="rotate(20 128 96)" />
          <Ellipse cx={68} cy={150} rx={14} ry={10} fill={c} transform="rotate(-15 68 150)" />
          <Ellipse cx={136} cy={176} rx={9} ry={7} fill={c} />
          <Ellipse cx={92} cy={200} rx={7} ry={5} fill={c} />
          <Circle cx={78} cy={92} r={4} fill={c} />
          <Circle cx={112} cy={140} r={3.5} fill={c} />
          <Circle cx={56} cy={186} r={3} fill={c} />
        </G>
        {/* the tiny spark mark */}
        <SparkPebble x={100} y={66} s={0.5} fill={ART.spark} />
        {/* cracks */}
        <G stroke={ART.crack} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {cracks >= 1 && <Path d="M148 110 L136 122 L145 132 L132 142" />}
          {cracks >= 2 && <Path d="M52 124 L66 134 L58 146 L72 156 L64 168" />}
          {cracks >= 3 && <Path d="M58 104 L76 96 L88 108 L102 94 L116 108 L128 96 L146 104" strokeWidth={4.5} />}
        </G>
      </Svg>
    </Animated.View>
  );
}
