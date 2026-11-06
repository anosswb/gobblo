import { useEffect, useId } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme-provider';

/**
 * The egg the pet hatches from (onboarding). Original art in the same glossy style as the pet.
 * `cracks` 0–3 draws more cracks; `wobble` makes it rock (it wants food).
 * Art colours live here on purpose: illustration, not UI.
 */
const ART = { shell: '#FFF4F7', shellMid: '#FFD3E1', shellDeep: '#F59AB8', spot: '#C6F432', crack: '#1B1530', ink: '#1B1530', white: '#FFFFFF' };

const CRACKS = [
  'M70 120 L84 132 L78 146 L94 156',
  'M130 112 L118 128 L128 140 L114 152',
  'M88 92 L100 104 L96 116 L108 124',
];

export function Egg({ size = 180, cracks = 0, wobble = true }: { size?: number; cracks?: number; wobble?: boolean }) {
  const { reduceMotion } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const shellId = `shell${uid}`;
  const rock = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !wobble) {
      rock.set(0);
      return;
    }
    // little impatient rocks, then a rest: an egg that wants food
    const fast = cracks > 0 ? 70 : 120;
    rock.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: fast, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: fast * 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: fast, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: cracks > 0 ? 260 : 1400 }),
        ),
        -1,
      ),
    );
  }, [reduceMotion, wobble, cracks, rock]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rock.get() * (4 + cracks * 2)}deg` }] }));

  return (
    <Animated.View style={[{ width: size, height: size * 1.15 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 200 230">
        <Defs>
          <RadialGradient id={shellId} cx="36%" cy="30%" r="80%">
            <Stop offset="0" stopColor={ART.white} />
            <Stop offset="0.45" stopColor={ART.shell} />
            <Stop offset="0.85" stopColor={ART.shellMid} />
            <Stop offset="1" stopColor={ART.shellDeep} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="100" cy="220" rx="56" ry="8" fill={ART.ink} opacity={0.16} />
        <Path d="M100 22 C150 22 176 104 176 146 C176 192 142 216 100 216 C58 216 24 192 24 146 C24 104 50 22 100 22Z" fill={`url(#${shellId})`} />
        <Ellipse cx="128" cy="92" rx="11" ry="8" fill={ART.spot} opacity={0.85} />
        <Ellipse cx="70" cy="168" rx="14" ry="10" fill={ART.spot} opacity={0.7} />
        <Ellipse cx="142" cy="170" rx="7" ry="5" fill={ART.spot} opacity={0.75} />
        <Ellipse cx="72" cy="72" rx="18" ry="10" fill={ART.white} opacity={0.7} transform="rotate(-35 72 72)" />
        {CRACKS.slice(0, cracks).map((d) => (
          <Path key={d} d={d} stroke={ART.crack} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
    </Animated.View>
  );
}
