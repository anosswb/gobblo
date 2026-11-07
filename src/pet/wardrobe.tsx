import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * The pet's wardrobe (Closet): hats on the head, items on the face. Original vector art on the
 * pet's 200 × 240 canvas (head top at y 54, eyes at x 80 / 120, y 128, mouth at y 152).
 * Art colours live here on purpose: illustration, not UI.
 */
export type HatId =
  | 'none'
  | 'party'
  | 'bow'
  | 'beanie'
  | 'flowers'
  | 'cap'
  | 'catEars'
  | 'sprout'
  | 'halo'
  | 'crown'
  | 'topHat'
  | 'chef'
  | 'wizard'
  | 'bunny'
  | 'goldCrown';

export type FaceId = 'none' | 'shades' | 'round' | 'hearts' | 'stars' | 'mustache';

/** Hats that sit where the antenna is: the antenna hides under them. */
export const HIDES_ANTENNA: ReadonlySet<HatId> = new Set<HatId>([
  'party',
  'beanie',
  'cap',
  'sprout',
  'halo',
  'crown',
  'topHat',
  'chef',
  'wizard',
  'goldCrown',
]);

const C = {
  ink: '#2A1533',
  white: '#FFFFFF',
  gold: '#FFC93C',
  goldDeep: '#E09B12',
  goldLight: '#FFE9A6',
  silver: '#DCE3EE',
  silverDeep: '#A8B3C5',
  pink: '#FF5C9D',
  pinkDeep: '#E0357A',
  red: '#FF3B5C',
  blue: '#5B6CFF',
  blueDeep: '#3D4BD6',
  orange: '#FF8A3D',
  orangeDeep: '#E0661A',
  green: '#3DD68C',
  greenDeep: '#1FA868',
  purple: '#7B4DFF',
  purpleDeep: '#5630D6',
  black: '#1C1C24',
  brown: '#5A3A2A',
  gem: '#4FD1FF',
};

function Sparkle({ x, y, s = 1, fill = C.white }: { x: number; y: number; s?: number; fill?: string }) {
  return <Path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8Z" transform={`translate(${x} ${y}) scale(${s})`} fill={fill} />;
}

function Crown({ body, deep, gems }: { body: string; deep: string; gems: boolean }) {
  return (
    <G>
      <Path d="M62 76 L64 38 L83 56 L100 28 L117 56 L136 38 L138 76 Q100 84 62 76Z" fill={body} />
      <Path d="M62 76 Q100 84 138 76 L138 68 Q100 76 62 68Z" fill={deep} />
      <Circle cx={64} cy={36} r={5} fill={body} />
      <Circle cx={100} cy={26} r={5.5} fill={body} />
      <Circle cx={136} cy={36} r={5} fill={body} />
      {gems ? (
        <G>
          <Circle cx={100} cy={60} r={6} fill={C.red} />
          <Circle cx={78} cy={66} r={4} fill={C.gem} />
          <Circle cx={122} cy={66} r={4} fill={C.gem} />
          <Circle cx={98} cy={58} r={2} fill={C.white} opacity={0.8} />
        </G>
      ) : (
        <Circle cx={100} cy={62} r={5} fill={C.pink} />
      )}
      <Path d="M70 44 L72 70" stroke={C.white} strokeWidth={3} opacity={0.5} strokeLinecap="round" />
    </G>
  );
}

export function HatArt({ id }: { id: HatId }) {
  switch (id) {
    case 'party':
      return (
        <G>
          <Path d="M70 70 Q102 82 132 70 L106 6Z" fill={C.gold} />
          <Path d="M84 46 L120 52 M93 28 L114 32" stroke={C.pink} strokeWidth={7} strokeLinecap="round" />
          <Path d="M70 70 Q102 82 132 70" stroke={C.pinkDeep} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Circle cx={106} cy={6} r={9} fill={C.pink} />
          <Circle cx={103} cy={3} r={3} fill={C.white} opacity={0.7} />
        </G>
      );
    case 'bow':
      return (
        <G transform="translate(132 62) rotate(18)">
          <Path d="M0 0 C-24 -20 -30 8 -26 14 C-20 22 -6 10 0 0Z" fill={C.red} />
          <Path d="M0 0 C24 -20 30 8 26 14 C20 22 6 10 0 0Z" fill={C.red} />
          <Path d="M-20 -2 C-14 -8 -8 -4 -4 0" stroke={C.white} strokeWidth={2.5} fill="none" opacity={0.5} strokeLinecap="round" />
          <Circle cx={0} cy={2} r={7} fill={C.pinkDeep} />
        </G>
      );
    case 'beanie':
      return (
        <G>
          <Path d="M50 86 C50 34 150 34 150 86Z" fill={C.blue} />
          <Path d="M70 50 C76 44 84 42 90 41" stroke={C.white} strokeWidth={4} opacity={0.35} fill="none" strokeLinecap="round" />
          <Rect x={46} y={76} width={108} height={20} rx={10} fill={C.blueDeep} />
          <Path d="M58 80 V92 M70 80 V92 M82 80 V92 M94 80 V92 M106 80 V92 M118 80 V92 M130 80 V92 M142 80 V92" stroke={C.blue} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={100} cy={34} r={11} fill={C.white} />
          <Circle cx={96} cy={30} r={3.5} fill={C.white} opacity={0.6} />
        </G>
      );
    case 'flowers':
      return (
        <G>
          {[
            [62, 74, C.pink],
            [80, 62, C.gold],
            [100, 58, C.white],
            [120, 62, C.gold],
            [138, 74, C.pink],
          ].map(([x, y, fill]) => (
            <G key={`${x}`} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <Ellipse key={a} cx={0} cy={-6} rx={4.5} ry={6.5} fill={fill as string} transform={`rotate(${a})`} />
              ))}
              <Circle cx={0} cy={0} r={3.5} fill={C.orange} />
            </G>
          ))}
          <Path d="M70 70 Q88 62 92 62 M108 62 Q114 62 130 70" stroke={C.green} strokeWidth={3} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'cap':
      return (
        <G>
          <Path d="M54 84 C54 40 146 40 146 84Z" fill={C.orange} />
          <Path d="M100 42 V84" stroke={C.orangeDeep} strokeWidth={2.5} />
          <Path d="M120 82 Q160 74 178 88 Q160 98 120 92Z" fill={C.orangeDeep} />
          <Circle cx={100} cy={42} r={5} fill={C.orangeDeep} />
          <Path d="M70 54 C76 48 84 46 90 45" stroke={C.white} strokeWidth={4} opacity={0.35} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'catEars':
      return (
        <G>
          <Path d="M58 80 L64 30 L94 62Z" fill={C.black} />
          <Path d="M142 80 L136 30 L106 62Z" fill={C.black} />
          <Path d="M66 70 L68 42 L86 62Z" fill={C.pink} />
          <Path d="M134 70 L132 42 L114 62Z" fill={C.pink} />
          <Path d="M56 82 Q100 58 144 82" stroke={C.black} strokeWidth={6} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'sprout':
      return (
        <G>
          <Path d="M100 58 Q98 40 102 26" stroke={C.greenDeep} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M102 30 C88 14 70 20 72 30 C80 38 96 36 102 30Z" fill={C.green} />
          <Path d="M102 26 C114 6 134 12 132 24 C124 34 108 32 102 26Z" fill={C.green} />
          <Path d="M80 28 Q90 28 98 30 M108 22 Q118 18 126 20" stroke={C.white} strokeWidth={2} opacity={0.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'halo':
      return (
        <G>
          <Ellipse cx={100} cy={28} rx={40} ry={11} fill="none" stroke={C.goldLight} strokeWidth={10} opacity={0.35} />
          <Ellipse cx={100} cy={28} rx={36} ry={9} fill="none" stroke={C.gold} strokeWidth={6} />
          <Sparkle x={146} y={18} s={0.9} fill={C.gold} />
          <Sparkle x={54} y={36} s={0.6} fill={C.goldLight} />
        </G>
      );
    case 'crown':
      return <Crown body={C.silver} deep={C.silverDeep} gems={false} />;
    case 'goldCrown':
      return (
        <G>
          <Crown body={C.gold} deep={C.goldDeep} gems />
          <Sparkle x={52} y={30} s={1} fill={C.goldLight} />
          <Sparkle x={150} y={22} s={0.8} fill={C.white} />
          <Sparkle x={122} y={14} s={0.6} fill={C.goldLight} />
        </G>
      );
    case 'topHat':
      return (
        <G>
          <Rect x={70} y={10} width={60} height={64} rx={8} fill={C.black} />
          <Rect x={70} y={52} width={60} height={12} fill={C.red} />
          <Path d="M50 78 Q100 64 150 78 Q100 90 50 78Z" fill={C.black} />
          <Path d="M78 18 V48" stroke={C.white} strokeWidth={4} opacity={0.18} strokeLinecap="round" />
        </G>
      );
    case 'chef':
      return (
        <G>
          <Circle cx={74} cy={44} r={20} fill={C.white} />
          <Circle cx={100} cy={30} r={24} fill={C.white} />
          <Circle cx={126} cy={44} r={20} fill={C.white} />
          <Rect x={66} y={50} width={68} height={30} rx={8} fill={C.white} />
          <Path d="M70 74 H130" stroke={C.silverDeep} strokeWidth={3} strokeLinecap="round" />
          <Path d="M88 56 V72 M100 54 V72 M112 56 V72" stroke={C.silver} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      );
    case 'wizard':
      return (
        <G>
          <Path d="M64 76 L120 -4 L140 76Z" fill={C.purple} />
          <Path d="M120 -4 L140 76 L128 76Z" fill={C.purpleDeep} />
          <Path d="M40 80 Q100 62 166 80 Q100 96 40 80Z" fill={C.purpleDeep} />
          <Sparkle x={104} y={40} s={1} fill={C.gold} />
          <Sparkle x={122} y={58} s={0.6} fill={C.goldLight} />
          <Circle cx={92} cy={62} r={3} fill={C.goldLight} />
        </G>
      );
    case 'bunny':
      return (
        <G>
          <Ellipse cx={78} cy={30} rx={13} ry={34} fill={C.white} transform="rotate(-12 78 30)" />
          <Ellipse cx={122} cy={30} rx={13} ry={34} fill={C.white} transform="rotate(12 122 30)" />
          <Ellipse cx={78} cy={32} rx={6} ry={24} fill={C.pink} opacity={0.7} transform="rotate(-12 78 32)" />
          <Ellipse cx={122} cy={32} rx={6} ry={24} fill={C.pink} opacity={0.7} transform="rotate(12 122 32)" />
          <Path d="M60 74 Q100 54 140 74" stroke={C.pink} strokeWidth={6} fill="none" strokeLinecap="round" />
        </G>
      );
    default:
      return null;
  }
}

function Heart({ x, y }: { x: number; y: number }) {
  return <Path d="M0 8 C-14 -2 -12 -14 -4 -14 C0 -14 0 -10 0 -10 C0 -10 0 -14 4 -14 C12 -14 14 -2 0 8Z" transform={`translate(${x} ${y + 2}) scale(1.35)`} />;
}

export function FaceArt({ id }: { id: FaceId }) {
  switch (id) {
    case 'shades':
      return (
        <G>
          <Rect x={62} y={118} width={36} height={22} rx={9} fill={C.black} />
          <Rect x={102} y={118} width={36} height={22} rx={9} fill={C.black} />
          <Path d="M98 124 Q100 121 102 124 M62 124 L48 118 M138 124 L152 118" stroke={C.black} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M68 124 L78 124 M108 124 L118 124" stroke={C.white} strokeWidth={3} opacity={0.55} strokeLinecap="round" />
        </G>
      );
    case 'round':
      return (
        <G>
          <Circle cx={80} cy={128} r={16} fill={C.white} opacity={0.18} stroke={C.ink} strokeWidth={4} />
          <Circle cx={120} cy={128} r={16} fill={C.white} opacity={0.18} stroke={C.ink} strokeWidth={4} />
          <Path d="M96 126 Q100 122 104 126 M64 126 L50 120 M136 126 L150 120" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'hearts':
      return (
        <G fill={C.red} opacity={0.92}>
          <Heart x={80} y={128} />
          <Heart x={120} y={128} />
          <Path d="M96 124 Q100 121 104 124" stroke={C.red} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'stars':
      return (
        <G>
          {[80, 120].map((x) => (
            <Path
              key={x}
              d="M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6Z"
              transform={`translate(${x} 128)`}
              fill={C.gold}
              stroke={C.goldDeep}
              strokeWidth={2}
            />
          ))}
          <Path d="M97 124 Q100 121 103 124" stroke={C.goldDeep} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'mustache':
      return (
        <Path
          d="M100 144 C94 138 82 138 76 146 C72 152 66 150 64 146 C66 156 80 158 90 152 C95 149 98 147 100 147 C102 147 105 149 110 152 C120 158 134 156 136 146 C134 150 128 152 124 146 C118 138 106 138 100 144Z"
          fill={C.brown}
        />
      );
    default:
      return null;
  }
}
