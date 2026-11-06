import { useEffect, useId, useState, type ReactNode } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { haptics } from '@/lib/haptics';
import { spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { petColors, type PetColor } from '@/theme/tokens';

/**
 * The pet, redrawn from the 32-emote sheet (Nov 2026) as one clean vector rig:
 * glossy jelly bean, no outline (light does the edges: radial body, bottom subsurface shade,
 * rim light, two speculars), arm nubs, feet, the lime antenna orb (brand signature).
 * The face is data: each mood picks eyes + mouth + brows + one extra. Calm dot eyes by default
 * (docs/11). It breathes, blinks, and squishes when tapped. Reduce Motion: still, no blink.
 * Art colours live here on purpose: this is an illustration, not UI.
 */
export type Mood =
  | 'happy'
  | 'calm'
  | 'excited'
  | 'love'
  | 'proud'
  | 'confident'
  | 'celebrating'
  | 'focused'
  | 'determined'
  | 'sleepy'
  | 'tired'
  | 'hungry'
  | 'chomp'
  | 'shocked'
  | 'curious'
  | 'confused'
  | 'worried'
  | 'overwhelmed';

export const MOODS: Mood[] = [
  'happy',
  'calm',
  'excited',
  'love',
  'proud',
  'confident',
  'celebrating',
  'focused',
  'determined',
  'sleepy',
  'tired',
  'hungry',
  'chomp',
  'shocked',
  'curious',
  'confused',
  'worried',
  'overwhelmed',
];

const ART = {
  ink: '#2A1533',
  white: '#FFFFFF',
  orb: '#C6F432',
  orbLight: '#F4FFC2',
  blush: '#FF3D7F',
  tongue: '#FF7FA8',
  heart: '#FF3B6B',
  star: '#FFD23F',
  drop: '#5AC8FA',
  mark: '#8E7CFF',
  shade: '#000000',
  phones: '#1C1C1E',
  phonesCup: '#3A3A3C',
};

type Eyes = 'dot' | 'big' | 'happy' | 'closed' | 'flat' | 'sparkle' | 'heart' | 'shades' | 'wide';
type Mouth = 'smile' | 'grin' | 'small' | 'o' | 'bigO' | 'frown' | 'flat' | 'chomp' | 'wobbly';
type Brows = 'none' | 'angry' | 'worried' | 'raised' | 'one';
type Extra = 'none' | 'hearts' | 'zz' | 'star' | 'sparkles' | 'drop' | 'question' | 'swirl' | 'drool';

const FACE: Record<Mood, { eyes: Eyes; mouth: Mouth; brows?: Brows; extra?: Extra }> = {
  happy: { eyes: 'dot', mouth: 'smile' },
  calm: { eyes: 'closed', mouth: 'small' },
  excited: { eyes: 'sparkle', mouth: 'grin', extra: 'sparkles' },
  love: { eyes: 'heart', mouth: 'small', extra: 'hearts' },
  proud: { eyes: 'closed', mouth: 'smile', extra: 'star' },
  confident: { eyes: 'shades', mouth: 'smile' },
  celebrating: { eyes: 'happy', mouth: 'grin', extra: 'sparkles' },
  focused: { eyes: 'flat', mouth: 'flat', brows: 'angry' },
  determined: { eyes: 'dot', mouth: 'flat', brows: 'angry', extra: 'star' },
  sleepy: { eyes: 'closed', mouth: 'small', extra: 'zz' },
  tired: { eyes: 'closed', mouth: 'o', brows: 'worried' },
  hungry: { eyes: 'big', mouth: 'o', extra: 'drool' },
  chomp: { eyes: 'happy', mouth: 'chomp' },
  shocked: { eyes: 'big', mouth: 'bigO', brows: 'raised' },
  curious: { eyes: 'dot', mouth: 'small', brows: 'one', extra: 'question' },
  confused: { eyes: 'dot', mouth: 'wobbly', brows: 'one', extra: 'question' },
  worried: { eyes: 'dot', mouth: 'frown', brows: 'worried', extra: 'drop' },
  overwhelmed: { eyes: 'wide', mouth: 'o', brows: 'worried', extra: 'swirl' },
};

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

const BODY = 'M100 54 C146 54 170 90 170 138 C170 192 142 222 100 222 C58 222 30 192 30 138 C30 90 54 54 100 54Z';
const LX = 80;
const RX = 120;
const EY = 128;
const MY = 152;
const STROKE = { stroke: ART.ink, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function EyesArt({ kind }: { kind: Eyes }) {
  const pair = (draw: (x: number, side: -1 | 1) => ReactNode) => (
    <>
      {draw(LX, -1)}
      {draw(RX, 1)}
    </>
  );
  switch (kind) {
    case 'dot':
      return pair((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={EY} rx={8} ry={9.5} fill={ART.ink} />
          <Circle cx={x + 2.8} cy={EY - 3.4} r={2.8} fill={ART.white} />
        </G>
      ));
    case 'big':
      return pair((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={EY - 1} rx={10} ry={12} fill={ART.ink} />
          <Circle cx={x + 3.5} cy={EY - 5} r={3.6} fill={ART.white} />
          <Circle cx={x - 3} cy={EY + 4} r={1.6} fill={ART.white} />
        </G>
      ));
    case 'wide':
      return pair((x) => (
        <G key={x}>
          <Path d={`M${x - 11} ${EY} Q${x} ${EY - 11} ${x + 11} ${EY} Q${x} ${EY + 11} ${x - 11} ${EY}Z`} {...STROKE} strokeWidth={4} />
          <Circle cx={x} cy={EY} r={3.6} fill={ART.ink} />
        </G>
      ));
    case 'happy':
      return pair((x) => <Path key={x} d={`M${x - 10} ${EY + 3} Q${x} ${EY - 10} ${x + 10} ${EY + 3}`} {...STROKE} strokeWidth={5.5} />);
    case 'closed':
      return pair((x) => <Path key={x} d={`M${x - 10} ${EY - 1} Q${x} ${EY + 8} ${x + 10} ${EY - 1}`} {...STROKE} strokeWidth={5} />);
    case 'flat':
      return pair((x) => <Path key={x} d={`M${x - 9} ${EY + 1} Q${x} ${EY - 3} ${x + 9} ${EY + 1}`} {...STROKE} strokeWidth={5.5} />);
    case 'sparkle':
      return pair((x) => (
        <G key={x}>
          <Path d={`M${x} ${EY - 11} L${x + 4} ${EY - 2} L${x + 11} ${EY} L${x + 4} ${EY + 2} L${x} ${EY + 11} L${x - 4} ${EY + 2} L${x - 11} ${EY} L${x - 4} ${EY - 2}Z`} fill={ART.ink} />
          <Circle cx={x + 1} cy={EY - 1} r={1.6} fill={ART.white} />
        </G>
      ));
    case 'heart':
      return pair((x) => <HeartShape key={x} x={x} y={EY + 1} s={1.15} />);
    case 'shades':
      return (
        <G>
          <Path d={`M${LX - 16} ${EY - 8} H${RX + 16}`} {...STROKE} strokeWidth={3.5} />
          <Path d={`M${LX - 15} ${EY - 8} H${LX + 13} V${EY + 1} Q${LX + 13} ${EY + 10} ${LX} ${EY + 10} Q${LX - 15} ${EY + 10} ${LX - 15} ${EY}Z`} fill={ART.ink} />
          <Path d={`M${RX - 13} ${EY - 8} H${RX + 15} V${EY} Q${RX + 15} ${EY + 10} ${RX} ${EY + 10} Q${RX - 13} ${EY + 10} ${RX - 13} ${EY + 1}Z`} fill={ART.ink} />
          <Path d={`M${LX - 9} ${EY - 4} L${LX - 3} ${EY - 4}`} stroke={ART.white} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
          <Path d={`M${RX - 7} ${EY - 4} L${RX - 1} ${EY - 4}`} stroke={ART.white} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </G>
      );
  }
}

function MouthArt({ kind }: { kind: Mouth }) {
  switch (kind) {
    case 'smile':
      return <Path d={`M90 ${MY - 2} Q100 ${MY + 9} 110 ${MY - 2}`} {...STROKE} strokeWidth={5} />;
    case 'small':
      return <Path d={`M95 ${MY} Q100 ${MY + 4} 105 ${MY}`} {...STROKE} strokeWidth={4.5} />;
    case 'grin':
      return (
        <G>
          <Path d={`M87 ${MY - 4} Q100 ${MY - 1} 113 ${MY - 4} Q112 ${MY + 13} 100 ${MY + 13} Q88 ${MY + 13} 87 ${MY - 4}Z`} fill={ART.ink} />
          <Path d={`M93 ${MY + 8} Q100 ${MY + 3} 107 ${MY + 8} Q104 ${MY + 12} 100 ${MY + 12} Q96 ${MY + 12} 93 ${MY + 8}Z`} fill={ART.tongue} />
        </G>
      );
    case 'chomp':
      return (
        <G>
          <Path d={`M84 ${MY - 6} Q100 ${MY - 2} 116 ${MY - 6} Q114 ${MY + 16} 100 ${MY + 16} Q86 ${MY + 16} 84 ${MY - 6}Z`} fill={ART.ink} />
          <Path d={`M91 ${MY - 4} V${MY + 1} M100 ${MY - 3} V${MY + 2} M109 ${MY - 4} V${MY + 1}`} stroke={ART.white} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={100} cy={MY + 11} rx={7} ry={3.5} fill={ART.tongue} />
        </G>
      );
    case 'o':
      return <Ellipse cx={100} cy={MY + 2} rx={5} ry={6.5} fill={ART.ink} />;
    case 'bigO':
      return <Ellipse cx={100} cy={MY + 3} rx={7.5} ry={9.5} fill={ART.ink} />;
    case 'frown':
      return <Path d={`M92 ${MY + 5} Q100 ${MY - 3} 108 ${MY + 5}`} {...STROKE} strokeWidth={4.5} />;
    case 'flat':
      return <Path d={`M94 ${MY + 2} H106`} {...STROKE} strokeWidth={4.5} />;
    case 'wobbly':
      return <Path d={`M90 ${MY + 2} Q95 ${MY - 3} 100 ${MY + 2} Q105 ${MY + 6} 110 ${MY + 1}`} {...STROKE} strokeWidth={4} />;
  }
}

function BrowsArt({ kind }: { kind: Brows }) {
  switch (kind) {
    case 'none':
      return null;
    case 'angry':
      return (
        <G>
          <Path d={`M${LX - 11} ${EY - 17} L${LX + 8} ${EY - 11}`} {...STROKE} strokeWidth={5} />
          <Path d={`M${RX + 11} ${EY - 17} L${RX - 8} ${EY - 11}`} {...STROKE} strokeWidth={5} />
        </G>
      );
    case 'worried':
      return (
        <G>
          <Path d={`M${LX - 10} ${EY - 12} L${LX + 8} ${EY - 18}`} {...STROKE} strokeWidth={4.5} />
          <Path d={`M${RX + 10} ${EY - 12} L${RX - 8} ${EY - 18}`} {...STROKE} strokeWidth={4.5} />
        </G>
      );
    case 'raised':
      return (
        <G>
          <Path d={`M${LX - 9} ${EY - 19} Q${LX} ${EY - 25} ${LX + 9} ${EY - 19}`} {...STROKE} strokeWidth={4.5} />
          <Path d={`M${RX - 9} ${EY - 19} Q${RX} ${EY - 25} ${RX + 9} ${EY - 19}`} {...STROKE} strokeWidth={4.5} />
        </G>
      );
    case 'one':
      return <Path d={`M${RX - 9} ${EY - 18} Q${RX} ${EY - 25} ${RX + 10} ${EY - 17}`} {...STROKE} strokeWidth={4.5} />;
  }
}

function HeartShape({ x, y, s = 1, fill = ART.heart }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <Path
      d="M0 3 C0 -2 -7 -6 -10 -1 C-12 3 -8 8 0 13 C8 8 12 3 10 -1 C7 -6 0 -2 0 3Z"
      transform={`translate(${x} ${y - 4 * s}) scale(${s})`}
      fill={fill}
    />
  );
}

function Spark({ x, y, s = 1, fill = ART.star }: { x: number; y: number; s?: number; fill?: string }) {
  return <Path d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10Z" transform={`translate(${x} ${y}) scale(${s})`} fill={fill} />;
}

function ExtraArt({ kind }: { kind: Extra }) {
  switch (kind) {
    case 'none':
      return null;
    case 'hearts':
      return (
        <G>
          <HeartShape x={160} y={74} s={1.1} />
          <HeartShape x={42} y={88} s={0.75} />
        </G>
      );
    case 'zz':
      return (
        <G>
          <Path d="M150 64 H162 L150 78 H162" {...STROKE} stroke={ART.mark} strokeWidth={4} />
          <Path d="M168 44 H176 L168 54 H176" {...STROKE} stroke={ART.mark} strokeWidth={3.5} opacity={0.7} />
        </G>
      );
    case 'star':
      return <Path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4Z" transform="translate(142 66)" fill={ART.star} />;
    case 'sparkles':
      return (
        <G>
          <Spark x={162} y={70} s={1.1} />
          <Spark x={40} y={84} s={0.8} fill={ART.orb} />
          <Spark x={174} y={104} s={0.55} fill={ART.white} />
        </G>
      );
    case 'drop':
      return <Path d="M0 -12 C5 -4 8 1 8 5 A8 8 0 0 1 -8 5 C-8 1 -5 -4 0 -12Z" transform="translate(152 96)" fill={ART.drop} />;
    case 'question':
      return <Path d="M150 66 Q150 54 160 54 Q170 54 170 63 Q170 70 161 73 V79 M161 88 V88.5" {...STROKE} stroke={ART.mark} strokeWidth={4.5} />;
    case 'swirl':
      return (
        <G>
          <Path d="M46 70 Q38 62 46 56 Q54 52 54 60" {...STROKE} stroke={ART.mark} strokeWidth={3.5} />
          <Path d="M154 70 Q162 62 154 56 Q146 52 146 60" {...STROKE} stroke={ART.mark} strokeWidth={3.5} />
        </G>
      );
    case 'drool':
      return <Path d="M0 0 C3 5 4 8 4 10 A4 4 0 0 1 -4 10 C-4 8 -3 5 0 0Z" transform="translate(110 157)" fill={ART.drop} opacity={0.9} />;
  }
}

export function Pet({
  size = 160,
  color = 'pink',
  mood = 'happy',
  stage = 0,
  headphones = false,
  working = false,
  onPress,
  accessibilityLabel,
}: {
  size?: number;
  color?: PetColor;
  mood?: Mood;
  /** evolution (docs/01): 0 baby blob · 1 lil gremlin (ears) · 2 big chonk (belly patch, tooth) · 3 cosmic menace (aura) */
  stage?: number;
  headphones?: boolean;
  /** quicker head-nod while a focus timer runs */
  working?: boolean;
  /** tap to squish (a light haptic + jelly wobble) */
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { reduceMotion } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ids = { body: `b${uid}`, under: `u${uid}`, orb: `o${uid}`, limb: `l${uid}`, aura: `a${uid}` };
  const c = petColors[color];
  const lit = shade(c, 0.22);
  const deep = shade(c, -0.14);
  const deeper = shade(c, -0.26);
  const light = shade(c, 0.62);
  const face = FACE[mood];

  // breathing
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      bob.set(0);
      return;
    }
    const period = working ? 650 : 1600;
    const ease = Easing.inOut(Easing.sin);
    bob.set(withRepeat(withSequence(withTiming(1, { duration: period, easing: ease }), withTiming(0, { duration: period, easing: ease })), -1));
  }, [working, reduceMotion, bob]);

  // squish on tap + a soft pop when the mood changes
  const squish = useSharedValue(0);
  const pop = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    pop.set(withSequence(withTiming(0.96, { duration: 80 }), withSpring(1, spring.squish)));
  }, [mood, reduceMotion, pop]);

  const style = useAnimatedStyle(() => {
    const b = bob.get();
    const q = squish.get();
    return {
      transformOrigin: 'center bottom',
      transform: [
        { translateY: -b * (working ? 2.5 : 4) },
        { scaleY: (1 + b * 0.022 - q * 0.1) * pop.get() },
        { scaleX: (1 - b * 0.012 + q * 0.08) * pop.get() },
      ],
    };
  });

  // blink every 3–6 s on open-eyed moods (a rare state flip, not a per-frame render)
  const [blink, setBlink] = useState(false);
  const canBlink = !reduceMotion && (face.eyes === 'dot' || face.eyes === 'big');
  useEffect(() => {
    if (!canBlink) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        t = setTimeout(() => {
          setBlink(false);
          loop();
        }, 130);
      }, 3000 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [canBlink]);

  const art = (
    <Animated.View style={[{ width: size, height: size * 1.2 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 240">
        <Defs>
          <RadialGradient id={ids.body} cx="34%" cy="24%" r="88%">
            <Stop offset="0" stopColor={light} />
            <Stop offset="0.32" stopColor={lit} />
            <Stop offset="0.72" stopColor={c} />
            <Stop offset="1" stopColor={deep} />
          </RadialGradient>
          <LinearGradient id={ids.under} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.55" stopColor={ART.shade} stopOpacity={0} />
            <Stop offset="1" stopColor={ART.shade} stopOpacity={0.1} />
          </LinearGradient>
          <RadialGradient id={ids.orb} cx="38%" cy="34%" r="70%">
            <Stop offset="0" stopColor={ART.orbLight} />
            <Stop offset="1" stopColor={ART.orb} />
          </RadialGradient>
          <RadialGradient id={ids.aura} cx="50%" cy="56%" r="50%">
            <Stop offset="0.35" stopColor={ART.mark} stopOpacity={0.45} />
            <Stop offset="0.7" stopColor={ART.orb} stopOpacity={0.14} />
            <Stop offset="1" stopColor={ART.orb} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={ids.limb} cx="40%" cy="30%" r="80%">
            <Stop offset="0" stopColor={lit} />
            <Stop offset="1" stopColor={c} />
          </RadialGradient>
        </Defs>

        {/* stage 4: cosmic aura */}
        {stage >= 3 && (
          <G>
            <Circle cx={100} cy={134} r={100} fill={`url(#${ids.aura})`} />
            <Spark x={22} y={70} s={0.7} fill={ART.orb} />
            <Spark x={184} y={56} s={0.55} fill={ART.white} />
            <Spark x={186} y={196} s={0.6} fill={ART.star} />
            <Spark x={14} y={190} s={0.45} fill={ART.white} />
          </G>
        )}

        {/* contact shadow */}
        <Ellipse cx={100} cy={229} rx={58} ry={7} fill={ART.shade} opacity={0.14} />

        {/* antenna */}
        {!headphones && (
          <G>
            <Path d="M100 58 Q96 36 111 22" stroke={deeper} strokeWidth={5} fill="none" strokeLinecap="round" />
            <Circle cx={112} cy={20} r={19} fill={ART.orb} opacity={0.22} />
            <Circle cx={112} cy={20} r={11} fill={`url(#${ids.orb})`} />
            <Circle cx={108.5} cy={16.5} r={3.2} fill={ART.white} opacity={0.9} />
          </G>
        )}

        {/* stage 2+: little ears */}
        {stage >= 1 && (
          <G>
            <Path d="M62 78 Q52 44 72 40 Q86 40 84 66Z" fill={`url(#${ids.limb})`} />
            <Path d="M138 78 Q148 44 128 40 Q114 40 116 66Z" fill={`url(#${ids.limb})`} />
            <Path d="M66 70 Q61 52 71 49" stroke={ART.white} strokeWidth={3} fill="none" opacity={0.45} strokeLinecap="round" />
          </G>
        )}

        {/* feet + arms behind the body */}
        <Ellipse cx={78} cy={218} rx={20} ry={10} fill={deeper} />
        <Ellipse cx={122} cy={218} rx={20} ry={10} fill={deeper} />
        <Ellipse cx={36} cy={152} rx={16} ry={11} transform="rotate(-28 36 152)" fill={`url(#${ids.limb})`} />
        <Ellipse cx={164} cy={152} rx={16} ry={11} transform="rotate(28 164 152)" fill={`url(#${ids.limb})`} />

        {/* body: radial light, bottom subsurface shade, rim light, speculars */}
        <Path d={BODY} fill={`url(#${ids.body})`} />
        <Path d={BODY} fill={`url(#${ids.under})`} />
        <Path d="M156 112 Q166 142 157 172" stroke={ART.white} strokeWidth={3.5} fill="none" opacity={0.28} strokeLinecap="round" />
        <Ellipse cx={70} cy={92} rx={17} ry={30} transform="rotate(-24 70 92)" fill={ART.white} opacity={0.32} />
        <Ellipse cx={64} cy={78} rx={6} ry={11} transform="rotate(-24 64 78)" fill={ART.white} opacity={0.85} />

        {/* stage 3+: belly patch */}
        {stage >= 2 && <Ellipse cx={100} cy={192} rx={34} ry={22} fill={light} opacity={0.42} />}

        {/* face */}
        <Ellipse cx={62} cy={152} rx={13} ry={7.5} fill={ART.blush} opacity={0.3} />
        <Ellipse cx={138} cy={152} rx={13} ry={7.5} fill={ART.blush} opacity={0.3} />
        <BrowsArt kind={face.brows ?? 'none'} />
        <EyesArt kind={blink ? 'closed' : face.eyes} />
        <MouthArt kind={face.mouth} />
        {stage >= 2 && face.mouth === 'smile' && <Path d="M101 155.5 h6 v4 q0 3 -3 3 q-3 0 -3 -3Z" fill={ART.white} />}
        <ExtraArt kind={face.extra ?? 'none'} />

        {/* headphones (focus room) */}
        {headphones && (
          <G>
            <Path d="M36 132 Q36 50 100 50 Q164 50 164 132" fill="none" stroke={ART.phones} strokeWidth={9} strokeLinecap="round" />
            <Path d="M18 116 Q18 108 26 108 H38 Q44 108 44 114 V152 Q44 158 38 158 H26 Q18 158 18 150Z" fill={ART.phones} />
            <Path d="M182 116 Q182 108 174 108 H162 Q156 108 156 114 V152 Q156 158 162 158 H174 Q182 158 182 150Z" fill={ART.phones} />
            <Path d="M24 118 V148 M176 118 V148" stroke={ART.phonesCup} strokeWidth={4} strokeLinecap="round" />
            <Circle cx={170} cy={114} r={3} fill={ART.orb} />
          </G>
        )}
      </Svg>
    </Animated.View>
  );

  if (!onPress) {
    return (
      <Animated.View accessibilityElementsHidden={!accessibilityLabel} importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'} accessibilityLabel={accessibilityLabel}>
        {art}
      </Animated.View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        if (reduceMotion) return;
        squish.set(withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }));
      }}
      onPressOut={() => {
        squish.set(reduceMotion ? 0 : withSpring(0, spring.squish));
      }}
      onPress={() => {
        haptics.light();
        onPress();
      }}>
      {art}
    </Pressable>
  );
}
