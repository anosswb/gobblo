import { useEffect, useId } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme-provider';
import { petColors, type PetColor } from '@/theme/tokens';

/**
 * The egg before hatching: glossy, tinted with the pet's colour, the lime orb already peeking
 * through the top (brand signature). `cracks` 0–3 draws the crack stages. Idles with a lazy
 * wobble; Reduce Motion keeps it still. Illustration colours live here on purpose.
 */
const ART = { shell: '#FFF6FA', crack: '#7A2E4F', white: '#FFFFFF', orb: '#C6F432', orbLight: '#F4FFC2', shade: '#000000' };
const SHELL = 'M100 26 C142 26 168 96 168 142 C168 192 138 222 100 222 C62 222 32 192 32 142 C32 96 58 26 100 26Z';

export function Egg({ size = 180, color = 'pink', cracks = 0, wobble = true }: { size?: number; color?: PetColor; cracks?: number; wobble?: boolean }) {
  const { reduceMotion } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const c = petColors[color];
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
          <RadialGradient id={`s${uid}`} cx="36%" cy="26%" r="85%">
            <Stop offset="0" stopColor={ART.white} />
            <Stop offset="0.55" stopColor={ART.shell} />
            <Stop offset="1" stopColor={c} stopOpacity={0.55} />
          </RadialGradient>
          <RadialGradient id={`o${uid}`} cx="38%" cy="34%" r="70%">
            <Stop offset="0" stopColor={ART.orbLight} />
            <Stop offset="1" stopColor={ART.orb} />
          </RadialGradient>
          <RadialGradient id={`g${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0.4" stopColor={ART.orb} stopOpacity={0.5} />
            <Stop offset="1" stopColor={ART.orb} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={100} cy={229} rx={56} ry={7} fill={ART.shade} opacity={0.14} />
        {/* the orb glows through the top of the shell */}
        <Circle cx={100} cy={30} r={22} fill={`url(#g${uid})`} />
        <Path d={SHELL} fill={`url(#s${uid})`} />
        {/* spots in the pet's colour */}
        <Ellipse cx={128} cy={96} rx={13} ry={10} fill={c} opacity={0.75} transform="rotate(20 128 96)" />
        <Ellipse cx={70} cy={150} rx={16} ry={12} fill={c} opacity={0.7} transform="rotate(-15 70 150)" />
        <Ellipse cx={134} cy={176} rx={10} ry={8} fill={c} opacity={0.65} />
        <Ellipse cx={92} cy={198} rx={8} ry={6} fill={c} opacity={0.55} />
        <Circle cx={100} cy={30} r={9} fill={`url(#o${uid})`} />
        {/* speculars */}
        <Ellipse cx={70} cy={84} rx={14} ry={28} transform="rotate(-22 70 84)" fill={ART.white} opacity={0.6} />
        <Ellipse cx={64} cy={70} rx={5} ry={10} transform="rotate(-22 64 70)" fill={ART.white} opacity={0.95} />
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
