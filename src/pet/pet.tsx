import { useIsFocused } from 'expo-router';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { useAppActive } from '@/hooks/use-app-active';
import { haptics } from '@/lib/haptics';
import { duration, easing, spring } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { petColors, type PetColor } from '@/theme/tokens';

import { FaceArt, HAT_TRANSFORM, HatArt, HIDES_EARS, type FaceId, type HatId } from './wardrobe';

/**
 * Gobblo the otter (docs/18), one flat vector rig like the B1 reference: bold simple shapes, no
 * outline, no gloss. Chibi: a wide round head (~60 % of the height) with a cream muzzle band, a
 * short pear body with a cream belly, short arms holding the lucky spark pebble, two small feet,
 * a thick paddle tail and two round ears. The face is data: each mood picks eyes + mouth + brows
 * + one extra. It breathes, blinks, squishes when tapped, and every 6-9 s fidgets with its pebble.
 * Reduce Motion / `still`: no idle motion. Art colours live here on purpose: illustration, not UI.
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

/**
 * Brand default body colour (docs/18 "warm caramel"). Used only when no `color` is passed.
 * TODO(lead): add `caramel: '#C98B5E'` to petColors in src/theme/tokens.ts and make it the default.
 */
export const OTTER_CARAMEL = '#C98B5E';

const ART = {
  ink: '#4A2E22', // dark cocoa: eyes, nose, mouth
  cream: '#FBEEDD', // muzzle, belly, forehead mark: the same for every body colour
  white: '#FFFFFF',
  blush: '#FF6F91',
  tongue: '#FF8FA3',
  heart: '#FF3B6B',
  drop: '#5AC8FA',
  mark: '#8E7CFF',
  shade: '#000000',
  phones: '#1C1C1E',
  phonesCup: '#3A3A3C',
};

/** The lucky pebble: warm yellow, a darker base and a lighter top highlight. */
const PEBBLE = { body: '#FFD166', base: '#F0B43C', light: '#FFE7A8' };

/** A chubby four-point spark (fat rounded tips, soft inner corners), 40 units wide, centred on 0 0. */
export const SPARK_PATH =
  'M-4.5 -15.5 A4.5 4.5 0 0 1 4.5 -15.5 C4.5 -9.5 9.5 -4.5 15.5 -4.5 A4.5 4.5 0 0 1 15.5 4.5 C9.5 4.5 4.5 9.5 4.5 15.5 A4.5 4.5 0 0 1 -4.5 15.5 C-4.5 9.5 -9.5 4.5 -15.5 4.5 A4.5 4.5 0 0 1 -15.5 -4.5 C-9.5 -4.5 -4.5 -9.5 -4.5 -15.5Z';

/**
 * The lucky pebble as SVG content (use inside an <Svg>): centred on x/y, `s` 1 = 40 units wide.
 * `flat` draws one colour only (marks, sparkles on busy art).
 */
export function SparkPebble({ x = 0, y = 0, s = 1, rotate = 0, fill, flat = false }: { x?: number; y?: number; s?: number; rotate?: number; fill?: string; flat?: boolean }) {
  const t = `translate(${x} ${y}) rotate(${rotate}) scale(${s})`;
  if (flat || fill) return <Path d={SPARK_PATH} transform={t} fill={fill ?? PEBBLE.body} />;
  return (
    <G transform={t}>
      <Path d={SPARK_PATH} transform="translate(0 2.4)" fill={PEBBLE.base} />
      <Path d={SPARK_PATH} fill={PEBBLE.body} />
      <Path d={SPARK_PATH} transform="translate(-2.5 -3.5) scale(0.42)" fill={PEBBLE.light} />
    </G>
  );
}

type Eyes = 'dot' | 'big' | 'happy' | 'closed' | 'flat' | 'sparkle' | 'heart' | 'shades' | 'wide';
type Mouth = 'smile' | 'grin' | 'small' | 'o' | 'bigO' | 'frown' | 'flat' | 'chomp' | 'wobbly' | 'lick';
type Brows = 'none' | 'angry' | 'worried' | 'raised' | 'one';
type Extra = 'none' | 'hearts' | 'zz' | 'star' | 'sparkles' | 'drop' | 'question' | 'swirl' | 'drool';

const FACE: Record<Mood, { eyes: Eyes; mouth: Mouth; brows?: Brows; extra?: Extra; blush?: boolean }> = {
  happy: { eyes: 'dot', mouth: 'smile' },
  calm: { eyes: 'closed', mouth: 'small' },
  excited: { eyes: 'sparkle', mouth: 'grin', extra: 'sparkles', blush: true },
  love: { eyes: 'heart', mouth: 'smile', extra: 'hearts', blush: true },
  proud: { eyes: 'closed', mouth: 'smile', extra: 'star' },
  confident: { eyes: 'shades', mouth: 'smile' },
  celebrating: { eyes: 'happy', mouth: 'grin', extra: 'sparkles', blush: true },
  focused: { eyes: 'flat', mouth: 'flat', brows: 'angry' },
  determined: { eyes: 'dot', mouth: 'flat', brows: 'angry', extra: 'star' },
  sleepy: { eyes: 'closed', mouth: 'small', extra: 'zz' },
  tired: { eyes: 'closed', mouth: 'o', brows: 'worried' },
  // hopeful, never sad: big shiny eyes, licking its lips
  hungry: { eyes: 'big', mouth: 'lick', brows: 'raised', extra: 'drool' },
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

// geometry on the 200 × 240 canvas
const HEAD = 'M100 34 C152 34 180 68 180 108 C180 140 150 158 100 158 C50 158 20 140 20 108 C20 68 48 34 100 34Z';
/** cream muzzle band: peaks under each eye, dips at the nose (clipped to the head) */
const BAND = 'M0 134 C18 128 42 114 66 117 C82 119 90 125 100 125 C110 125 118 119 134 117 C158 114 182 128 200 134 V240 H0Z';
const BODY = 'M100 136 C136 136 152 170 152 196 C152 216 134 226 100 226 C66 226 48 216 48 196 C48 170 64 136 100 136Z';
const TAIL = 'M138 196 C152 194 170 184 184 184 C196 185 197 200 186 206 C172 214 152 218 136 216Z';
const NOSE = 'M91 118 Q91 113 100 113 Q109 113 109 118 Q109 123 100 125 Q91 123 91 118Z';
const LX = 66;
const RX = 134;
const EY = 110;
const MY = 127;
const PEB_X = 100;
const PEB_Y = 166;
const PEB_S = 1.15;
/** stage growth: the pup is a little smaller, scaled from the feet */
const STAGE_SCALE = [0.88, 0.94, 1, 1, 1];
const stageTransform = (stage: number) => {
  const k = STAGE_SCALE[Math.max(0, Math.min(4, stage))] ?? 1;
  return `translate(100 230) scale(${k}) translate(-100 -230)`;
};
const STROKE = { stroke: ART.ink, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function EyesArt({ kind }: { kind: Eyes }) {
  const pair = (draw: (x: number) => ReactNode) => (
    <>
      {draw(LX)}
      {draw(RX)}
    </>
  );
  switch (kind) {
    case 'dot':
      return pair((x) => <Ellipse key={x} cx={x} cy={EY} rx={7.5} ry={8.5} fill={ART.ink} />);
    case 'big':
      return pair((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={EY - 1} rx={9.5} ry={11} fill={ART.ink} />
          <Circle cx={x + 3} cy={EY - 5} r={3.4} fill={ART.white} />
          <Circle cx={x - 3} cy={EY + 3.5} r={1.5} fill={ART.white} />
        </G>
      ));
    case 'wide':
      return pair((x) => (
        <G key={x}>
          <Path d={`M${x - 10} ${EY} Q${x} ${EY - 10} ${x + 10} ${EY} Q${x} ${EY + 10} ${x - 10} ${EY}Z`} {...STROKE} strokeWidth={3.5} />
          <Circle cx={x} cy={EY} r={3.4} fill={ART.ink} />
        </G>
      ));
    case 'happy':
      return pair((x) => <Path key={x} d={`M${x - 9} ${EY + 3} Q${x} ${EY - 8} ${x + 9} ${EY + 3}`} {...STROKE} strokeWidth={5} />);
    case 'closed':
      return pair((x) => <Path key={x} d={`M${x - 9} ${EY - 1} Q${x} ${EY + 7} ${x + 9} ${EY - 1}`} {...STROKE} strokeWidth={4.5} />);
    case 'flat':
      return pair((x) => <Path key={x} d={`M${x - 8} ${EY + 1} Q${x} ${EY - 3} ${x + 8} ${EY + 1}`} {...STROKE} strokeWidth={5} />);
    case 'sparkle':
      return pair((x) => (
        <G key={x}>
          <SparkPebble x={x} y={EY} s={0.58} fill={ART.ink} />
          <Circle cx={x + 1} cy={EY - 1} r={1.6} fill={ART.white} />
        </G>
      ));
    case 'heart':
      return pair((x) => <HeartShape key={x} x={x} y={EY + 1} s={1.05} />);
    case 'shades':
      return (
        <G>
          <Path d={`M${LX - 16} ${EY - 8} H${RX + 16}`} {...STROKE} strokeWidth={3.5} />
          <Path d={`M${LX - 15} ${EY - 8} H${LX + 14} V${EY + 1} Q${LX + 14} ${EY + 10} ${LX} ${EY + 10} Q${LX - 15} ${EY + 10} ${LX - 15} ${EY}Z`} fill={ART.ink} />
          <Path d={`M${RX - 14} ${EY - 8} H${RX + 15} V${EY} Q${RX + 15} ${EY + 10} ${RX} ${EY + 10} Q${RX - 14} ${EY + 10} ${RX - 14} ${EY + 1}Z`} fill={ART.ink} />
          <Path d={`M${LX - 9} ${EY - 4} L${LX - 3} ${EY - 4} M${RX - 7} ${EY - 4} L${RX - 1} ${EY - 4}`} stroke={ART.white} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </G>
      );
  }
}

function MouthArt({ kind }: { kind: Mouth }) {
  // the "w": a tiny stem from the nose, then two soft arcs
  const w = (half: number, dip: number) => `M100 ${MY - 3} V${MY} M${100 - half} ${MY} Q${100 - half / 2} ${MY + dip} 100 ${MY} Q${100 + half / 2} ${MY + dip} ${100 + half} ${MY}`;
  switch (kind) {
    case 'smile':
      return <Path d={w(12, 7)} {...STROKE} strokeWidth={3.6} />;
    case 'small':
      return <Path d={w(7, 4.5)} {...STROKE} strokeWidth={3.4} />;
    case 'lick':
      return (
        <G>
          <Ellipse cx={106.5} cy={MY + 4} rx={3.8} ry={4.4} fill={ART.tongue} />
          <Path d={w(12, 7)} {...STROKE} strokeWidth={3.6} />
        </G>
      );
    case 'grin':
      return (
        <G>
          <Path d={`M88 ${MY + 1} Q100 ${MY + 4} 112 ${MY + 1} Q111 ${MY + 15} 100 ${MY + 15} Q89 ${MY + 15} 88 ${MY + 1}Z`} fill={ART.ink} />
          <Path d={`M93 ${MY + 11} Q100 ${MY + 6} 107 ${MY + 11} Q104 ${MY + 14} 100 ${MY + 14} Q96 ${MY + 14} 93 ${MY + 11}Z`} fill={ART.tongue} />
        </G>
      );
    case 'chomp':
      return (
        <G>
          <Path d={`M85 ${MY} Q100 ${MY + 4} 115 ${MY} Q113 ${MY + 16} 100 ${MY + 16} Q87 ${MY + 16} 85 ${MY}Z`} fill={ART.ink} />
          <Path d={`M92 ${MY + 2.5} V${MY + 6} M108 ${MY + 2.5} V${MY + 6}`} stroke={ART.white} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={100} cy={MY + 12} rx={6.5} ry={3.2} fill={ART.tongue} />
        </G>
      );
    case 'o':
      return <Ellipse cx={100} cy={MY + 5} rx={4.5} ry={5.5} fill={ART.ink} />;
    case 'bigO':
      return <Ellipse cx={100} cy={MY + 7} rx={6.5} ry={8.5} fill={ART.ink} />;
    case 'frown':
      return <Path d={`M93 ${MY + 7} Q100 ${MY + 1} 107 ${MY + 7}`} {...STROKE} strokeWidth={3.6} />;
    case 'flat':
      return <Path d={`M94 ${MY + 3} H106`} {...STROKE} strokeWidth={3.6} />;
    case 'wobbly':
      return <Path d={`M89 ${MY + 4} Q94 ${MY} 100 ${MY + 4} Q106 ${MY + 8} 111 ${MY + 3}`} {...STROKE} strokeWidth={3.4} />;
  }
}

function BrowsArt({ kind }: { kind: Brows }) {
  switch (kind) {
    case 'none':
      return null;
    case 'angry':
      return <Path d={`M${LX - 10} ${EY - 17} L${LX + 8} ${EY - 11} M${RX + 10} ${EY - 17} L${RX - 8} ${EY - 11}`} {...STROKE} strokeWidth={4.5} />;
    case 'worried':
      return <Path d={`M${LX - 9} ${EY - 12} L${LX + 8} ${EY - 17} M${RX + 9} ${EY - 12} L${RX - 8} ${EY - 17}`} {...STROKE} strokeWidth={4} />;
    case 'raised':
      return <Path d={`M${LX - 8} ${EY - 17} Q${LX} ${EY - 23} ${LX + 8} ${EY - 17} M${RX - 8} ${EY - 17} Q${RX} ${EY - 23} ${RX + 8} ${EY - 17}`} {...STROKE} strokeWidth={4} />;
    case 'one':
      return <Path d={`M${RX - 8} ${EY - 17} Q${RX} ${EY - 24} ${RX + 9} ${EY - 16}`} {...STROKE} strokeWidth={4} />;
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

function ExtraArt({ kind }: { kind: Extra }) {
  switch (kind) {
    case 'none':
      return null;
    case 'hearts':
      return (
        <G>
          <HeartShape x={176} y={34} s={1.1} />
          <HeartShape x={20} y={30} s={0.75} />
        </G>
      );
    case 'zz':
      return (
        <G>
          <Path d="M160 24 H172 L160 38 H172" {...STROKE} stroke={ART.mark} strokeWidth={4} />
          <Path d="M178 6 H186 L178 16 H186" {...STROKE} stroke={ART.mark} strokeWidth={3.5} opacity={0.7} />
        </G>
      );
    case 'star':
      return <SparkPebble x={172} y={28} s={0.62} />;
    case 'sparkles':
      return (
        <G>
          <SparkPebble x={172} y={28} s={0.6} />
          <SparkPebble x={24} y={30} s={0.42} />
          <SparkPebble x={188} y={86} s={0.3} fill={ART.white} />
        </G>
      );
    case 'drop':
      return <Path d="M0 -12 C5 -4 8 1 8 5 A8 8 0 0 1 -8 5 C-8 1 -5 -4 0 -12Z" transform="translate(166 84)" fill={ART.drop} />;
    case 'question':
      return <Path d="M162 20 Q162 8 172 8 Q182 8 182 17 Q182 24 173 27 V33 M173 42 V42.5" {...STROKE} stroke={ART.mark} strokeWidth={4.5} />;
    case 'swirl':
      return (
        <G>
          <Path d="M24 32 Q16 24 24 18 Q32 14 32 22" {...STROKE} stroke={ART.mark} strokeWidth={3.5} />
          <Path d="M176 32 Q184 24 176 18 Q168 14 168 22" {...STROKE} stroke={ART.mark} strokeWidth={3.5} />
        </G>
      );
    case 'drool':
      return <Path d="M0 0 C3 5 4 8 4 10 A4 4 0 0 1 -4 10 C-4 8 -3 5 0 0Z" transform="translate(113 131)" fill={ART.drop} opacity={0.9} />;
  }
}

/** Arms behind the pebble (they stay put while the pebble fidgets). */
function Arms({ c }: { c: string }) {
  return (
    <G>
      <Ellipse cx={72} cy={170} rx={13} ry={17} transform="rotate(-20 72 170)" fill={c} />
      <Ellipse cx={128} cy={170} rx={13} ry={17} transform="rotate(20 128 170)" fill={c} />
    </G>
  );
}

/** Paws in front of the pebble, with two tiny finger lines each. */
function Paws({ c, line }: { c: string; line: string }) {
  return (
    <G>
      <Ellipse cx={78} cy={170} rx={9} ry={10} fill={c} />
      <Ellipse cx={122} cy={170} rx={9} ry={10} fill={c} />
      <Path d="M81 167 h4 M81 173 h4 M119 167 h-4 M119 173 h-4" stroke={line} strokeWidth={2} strokeLinecap="round" />
    </G>
  );
}

export function Pet({
  size = 160,
  color,
  mood = 'happy',
  stage = 0,
  headphones = false,
  working = false,
  still = false,
  hat = 'none',
  face: faceItem = 'none',
  mark = true,
  onPress,
  accessibilityLabel,
}: {
  size?: number;
  /** body colour; cream parts and the pebble stay the same. Omitted: the brand caramel. */
  color?: PetColor;
  mood?: Mood;
  /** growth (docs/01): 0 pup (smaller) · 1 cheek fluff · 2 full size + head tuft, chubbier belly · 3 soft glow ring · 4 level-20 legend (gold glow) */
  stage?: number;
  headphones?: boolean;
  /** quicker head-nod while a focus timer runs */
  working?: boolean;
  /** no breathing, blinking or fidgeting: galleries, share cards (many pets on screen = dropped frames) */
  still?: boolean;
  /** Closet: what the pet wears (src/pet/wardrobe.tsx) */
  hat?: HatId;
  face?: FaceId;
  /** the small cream spark on the forehead (brand mark) */
  mark?: boolean;
  /** tap to squish (a light haptic + jelly wobble) */
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { reduceMotion } = useTheme();
  // idle loops only run while someone can see them: not on a hidden tab, not in the background
  const focused = useIsFocused();
  const appActive = useAppActive();
  const idle = !reduceMotion && !still && focused && appActive;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ids = { head: `h${uid}`, aura: `a${uid}`, gold: `g${uid}` };
  const c = color ? petColors[color] : OTTER_CARAMEL;
  const deep = shade(c, -0.16);
  const deeper = shade(c, -0.3);
  const face = FACE[mood];
  const showEars = !headphones && !HIDES_EARS.has(hat);
  const st = stageTransform(stage);

  // breathing
  const bob = useSharedValue(0);
  useEffect(() => {
    if (!idle) {
      cancelAnimation(bob);
      bob.set(withTiming(0, { duration: 150 }));
      return;
    }
    const period = working ? 650 : 1600;
    const ease = Easing.inOut(Easing.sin);
    bob.set(withRepeat(withSequence(withTiming(1, { duration: period, easing: ease }), withTiming(0, { duration: period, easing: ease })), -1));
  }, [working, idle, bob]);

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
  const canBlink = idle && (face.eyes === 'dot' || face.eyes === 'big');
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

  // pebble fidget every 6–9 s: a little hop and a rock in the paws
  const hop = useSharedValue(0);
  const roll = useSharedValue(0);
  useEffect(() => {
    if (!idle) {
      cancelAnimation(hop);
      cancelAnimation(roll);
      hop.set(0);
      roll.set(0);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        roll.set(
          withSequence(
            withTiming(-16, { duration: duration.fast, easing: easing.smoothOut }),
            withTiming(12, { duration: duration.fast, easing: easing.inOut }),
            withSpring(0, spring.squish),
          ),
        );
        hop.set(withSequence(withTiming(1, { duration: duration.fast, easing: easing.smoothOut }), withSpring(0, spring.squish)));
        loop();
      }, 6000 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [idle, hop, roll]);

  const k = STAGE_SCALE[Math.max(0, Math.min(4, stage))] ?? 1;
  const pebbleOrigin = `50% ${((230 + (PEB_Y - 230) * k) / 240) * 100}%`;
  const unit = size / 200;
  const pebbleStyle = useAnimatedStyle(() => ({
    transformOrigin: pebbleOrigin,
    transform: [{ translateY: -hop.get() * 9 * unit }, { rotate: `${roll.get()}deg` }],
  }));
  const pawStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -hop.get() * 4 * unit }] }));

  // `still` pets draw everything in one Svg; live pets lift the pebble + paws into two thin layers
  const layered = !still;

  const art = (
    <Animated.View style={[{ width: size, height: size * 1.2 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 240">
        <Defs>
          <ClipPath id={ids.head}>
            <Path d={HEAD} />
          </ClipPath>
          <RadialGradient id={ids.gold} cx="50%" cy="50%" r="50%">
            <Stop offset="0.3" stopColor={PEBBLE.body} stopOpacity={0.55} />
            <Stop offset="0.7" stopColor={PEBBLE.body} stopOpacity={0.16} />
            <Stop offset="1" stopColor={PEBBLE.body} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <G transform={st}>
          {/* level 20 legend: golden glow + gold pebbles (the final surprise) */}
          {stage >= 4 && (
            <G>
              <Circle cx={100} cy={134} r={104} fill={`url(#${ids.gold})`} />
              <SparkPebble x={18} y={96} s={0.5} />
              <SparkPebble x={186} y={78} s={0.4} fill={ART.white} />
              <SparkPebble x={180} y={204} s={0.4} />
              <SparkPebble x={22} y={204} s={0.32} fill={ART.white} />
              <SparkPebble x={100} y={10} s={0.34} />
            </G>
          )}

          {/* stage 3: a soft glow ring */}
          {stage === 3 && (
            <G>
              <Circle cx={100} cy={134} r={90} fill="none" stroke={PEBBLE.body} strokeWidth={12} opacity={0.16} />
              <Circle cx={100} cy={134} r={90} fill="none" stroke={PEBBLE.body} strokeWidth={3} opacity={0.4} />
              <SparkPebble x={22} y={70} s={0.36} />
              <SparkPebble x={180} y={196} s={0.3} fill={ART.white} />
            </G>
          )}

          {/* contact shadow */}
          <Ellipse cx={100} cy={231} rx={58} ry={6.5} fill={ART.shade} opacity={0.12} />

          {/* tail (a thick paddle peeking out on the right) */}
          <Path d={TAIL} fill={deep} />

          {/* ears: tucked under hats that cover them */}
          {showEars && (
            <G>
              <Circle cx={36} cy={60} r={16} fill={deep} />
              <Circle cx={37} cy={61} r={8.5} fill={deeper} />
              <Circle cx={164} cy={60} r={16} fill={deep} />
              <Circle cx={163} cy={61} r={8.5} fill={deeper} />
            </G>
          )}

          {/* feet */}
          <Ellipse cx={78} cy={223} rx={17} ry={9} fill={deep} />
          <Ellipse cx={122} cy={223} rx={17} ry={9} fill={deep} />
          <Path d="M72 226 v-5 M78 227 v-5 M122 227 v-5 M128 226 v-5" stroke={deeper} strokeWidth={2} strokeLinecap="round" />

          {/* body + belly (chubbier from stage 2) */}
          <Path d={BODY} fill={c} />
          <Ellipse cx={100} cy={196} rx={stage >= 2 ? 33 : 30} ry={stage >= 2 ? 26 : 24} fill={ART.cream} />

          {/* puffed cheeks while chewing */}
          {face.mouth === 'chomp' && (
            <G>
              <Ellipse cx={28} cy={132} rx={16} ry={18} fill={ART.cream} />
              <Ellipse cx={172} cy={132} rx={16} ry={18} fill={ART.cream} />
            </G>
          )}

          {/* stage 1+: cheek fluff */}
          {stage >= 1 && (
            <G>
              <Path d="M26 128 Q13 131 19 138 Q11 145 30 148Z" fill={ART.cream} />
              <Path d="M174 128 Q187 131 181 138 Q189 145 170 148Z" fill={ART.cream} />
            </G>
          )}

          {/* stage 2+: a little head tuft */}
          {stage >= 2 && <Path d="M88 40 Q90 26 97 34 Q100 22 104 34 Q111 26 113 40Z" fill={c} />}

          {/* head + cream muzzle band, a soft shade where the head meets the body */}
          <Path d={HEAD} fill={c} />
          <G clipPath={`url(#${ids.head})`}>
            <Path d={BAND} fill={ART.cream} />
            <Path d="M0 150 Q100 166 200 150 V240 H0Z" fill={deep} opacity={0.18} />
          </G>

          {/* the forehead spark (brand mark); hats that cover the forehead hide it */}
          {mark && (headphones || !HIDES_EARS.has(hat)) && <SparkPebble x={100} y={80} s={0.42} fill={ART.cream} />}

          {/* cheeks: a love blush, then three freckle dots each */}
          {face.blush && (
            <G>
              <Ellipse cx={48} cy={136} rx={11} ry={6} fill={ART.blush} opacity={0.32} />
              <Ellipse cx={152} cy={136} rx={11} ry={6} fill={ART.blush} opacity={0.32} />
            </G>
          )}
          <G fill={deep} opacity={0.8}>
            <Circle cx={44} cy={128} r={2} />
            <Circle cx={52} cy={126} r={2} />
            <Circle cx={49} cy={133} r={2} />
            <Circle cx={156} cy={128} r={2} />
            <Circle cx={148} cy={126} r={2} />
            <Circle cx={151} cy={133} r={2} />
          </G>

          {/* face */}
          <BrowsArt kind={face.brows ?? 'none'} />
          <EyesArt kind={blink ? 'closed' : face.eyes} />
          <MouthArt kind={face.mouth} />
          <Path d={NOSE} fill={ART.ink} />
          <ExtraArt kind={face.extra ?? 'none'} />
          <FaceArt id={faceItem} />
          {!headphones && (
            <G transform={HAT_TRANSFORM}>
              <HatArt id={hat} />
            </G>
          )}

          {/* headphones (focus room) */}
          {headphones && (
            <G>
              <Path d="M24 112 Q24 28 100 28 Q176 28 176 112" fill="none" stroke={ART.phones} strokeWidth={9} strokeLinecap="round" />
              <Path d="M6 98 Q6 90 14 90 H28 Q34 90 34 96 V134 Q34 140 28 140 H14 Q6 140 6 132Z" fill={ART.phones} />
              <Path d="M194 98 Q194 90 186 90 H172 Q166 90 166 96 V134 Q166 140 172 140 H186 Q194 140 194 132Z" fill={ART.phones} />
              <Path d="M12 100 V130 M188 100 V130" stroke={ART.phonesCup} strokeWidth={4} strokeLinecap="round" />
              <Circle cx={180} cy={96} r={3} fill={PEBBLE.body} />
            </G>
          )}

          {/* arms, the lucky pebble held with both paws in front of the chest */}
          <Arms c={c} />
          {!layered && (
            <G>
              <SparkPebble x={PEB_X} y={PEB_Y} s={PEB_S} />
              <Paws c={c} line={deeper} />
            </G>
          )}
        </G>
      </Svg>
      {layered && (
        <>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, pebbleStyle]}>
            <Svg width="100%" height="100%" viewBox="0 0 200 240">
              <G transform={st}>
                <SparkPebble x={PEB_X} y={PEB_Y} s={PEB_S} />
              </G>
            </Svg>
          </Animated.View>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, pawStyle]}>
            <Svg width="100%" height="100%" viewBox="0 0 200 240">
              <G transform={st}>
                <Paws c={c} line={deeper} />
              </G>
            </Svg>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );

  if (!onPress) {
    return (
      <View accessibilityElementsHidden={!accessibilityLabel} importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'} accessibilityLabel={accessibilityLabel}>
        {art}
      </View>
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
