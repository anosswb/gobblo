import { useEffect, useId } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme-provider';
import { petColors, type PetColor } from '@/theme/tokens';

/**
 * Temporary pet (Phase 1–4). Same silhouette rules as docs/11: glossy jelly bean, small dot
 * eyes, lime antenna orb. Phase 2 replaces it with the layered Skia pet built from the R1 sheet.
 * Art colours live here on purpose: this is an illustration, not UI.
 */
const ART = { ink: '#1B1530', orb: '#C6F432', orbLight: '#F3FFB8', white: '#FFFFFF', blush: '#FF6F98', phones: '#3D3BFF' };

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const ch = (v: number) => Math.round((t - v) * p + v);
  const r = ch(n >> 16);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function PetStandin({
  size = 160,
  color = 'pink',
  headphones = false,
  working = false,
  sleepy = false,
}: {
  size?: number;
  color?: PetColor;
  headphones?: boolean;
  working?: boolean;
  sleepy?: boolean;
}) {
  const { reduceMotion } = useTheme();
  // unique gradient ids: several pets can be mounted at once (home under focus)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bodyId = `body${uid}`;
  const orbId = `orb${uid}`;
  const bob = useSharedValue(0);
  const c = petColors[color];
  const deep = shade(c, -0.28);
  const light = shade(c, 0.45);

  useEffect(() => {
    if (reduceMotion) {
      bob.set(0);
      return;
    }
    const period = working ? 700 : 1300; // head-nod while working, slow breathing at rest
    bob.set(withRepeat(withSequence(withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: period, easing: Easing.inOut(Easing.sin) })), -1));
  }, [working, reduceMotion, bob]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.get() * (working ? 3 : 5) }, { scaleY: 1 + bob.get() * 0.025 }, { scaleX: 1 - bob.get() * 0.012 }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size * 1.15 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 200 230">
        <Defs>
          <RadialGradient id={bodyId} cx="35%" cy="28%" r="80%">
            <Stop offset="0" stopColor={light} />
            <Stop offset="0.55" stopColor={c} />
            <Stop offset="1" stopColor={deep} />
          </RadialGradient>
          <RadialGradient id={orbId} cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor={ART.orbLight} />
            <Stop offset="1" stopColor={ART.orb} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="100" cy="222" rx="54" ry="7" fill={ART.ink} opacity={0.18} />
        {!headphones && (
          <>
            <Path d="M100 52 Q98 30 108 18" stroke={deep} strokeWidth={5} fill="none" strokeLinecap="round" />
            <Circle cx="109" cy="16" r="13" fill={ART.orb} opacity={0.35} />
            <Circle cx="109" cy="16" r="9" fill={`url(#${orbId})`} />
          </>
        )}
        <Ellipse cx="72" cy="214" rx="20" ry="11" fill={deep} />
        <Ellipse cx="128" cy="214" rx="20" ry="11" fill={deep} />
        <Ellipse cx="34" cy="150" rx="14" ry="11" fill={c} />
        <Ellipse cx="166" cy="150" rx="14" ry="11" fill={c} />
        <Path d="M100 48 C150 48 172 92 172 138 C172 186 142 214 100 214 C58 214 28 186 28 138 C28 92 50 48 100 48Z" fill={`url(#${bodyId})`} />
        <Ellipse cx="68" cy="88" rx="22" ry="12" fill={ART.white} opacity={0.55} transform="rotate(-30 68 88)" />
        {sleepy ? (
          <>
            <Path d="M72 128 Q80 133 88 128" stroke={ART.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            <Path d="M112 128 Q120 133 128 128" stroke={ART.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Circle cx="80" cy="128" r="7.5" fill={ART.ink} />
            <Circle cx="120" cy="128" r="7.5" fill={ART.ink} />
            <Circle cx="82.5" cy="125.5" r="2.2" fill={ART.white} />
            <Circle cx="122.5" cy="125.5" r="2.2" fill={ART.white} />
          </>
        )}
        <Ellipse cx="64" cy="146" rx="11" ry="6" fill={ART.blush} opacity={0.55} />
        <Ellipse cx="136" cy="146" rx="11" ry="6" fill={ART.blush} opacity={0.55} />
        <Path d="M92 146 Q100 154 108 146" stroke={ART.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        {headphones && (
          <>
            <Path d="M34 128 Q34 44 100 44 Q166 44 166 128" fill="none" stroke={ART.ink} strokeWidth={9} strokeLinecap="round" />
            <Rect x="18" y="110" width="26" height="44" rx="12" fill={ART.phones} stroke={ART.ink} strokeWidth={3} />
            <Rect x="156" y="110" width="26" height="44" rx="12" fill={ART.phones} stroke={ART.ink} strokeWidth={3} />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}
