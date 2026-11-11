import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * The pet's wardrobe (Closet): hats on the head, items on the face. Original vector art.
 * Hats are drawn on their own 200-wide grid (brim around y 76-86) and pet.tsx scales them onto the
 * otter's wide round head (HAT_TRANSFORM). Face items sit on the otter's face directly: eyes at
 * x 66 / 134, y 110; nose at y 113-125; mouth at y 127.
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
  | 'goldCrown'
  // weekly surprises (features/weekly)
  | 'mushroom'
  | 'friedEgg'
  | 'bucket'
  | 'propeller'
  | 'cowboy'
  | 'cherries';

export type FaceId = 'none' | 'shades' | 'round' | 'hearts' | 'stars' | 'mustache';

/** Where the hat grid lands on the otter head (pet.tsx wraps HatArt in this). */
export const HAT_TRANSFORM = 'translate(100 50) scale(1.42) translate(-100 -72)';

/** Hats that cover the top-sides of the head: the round ears tuck under them (no poking through). */
export const HIDES_EARS: ReadonlySet<HatId> = new Set<HatId>([
  'beanie',
  'cap',
  'catEars',
  'bunny',
  'topHat',
  'wizard',
  'mushroom',
  'friedEgg',
  'bucket',
  'propeller',
  'cowboy',
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
  cream: '#FFF3DC',
  tan: '#8A5A3C',
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
    case 'mushroom':
      return (
        <G>
          <Path d="M42 84 C42 22 158 22 158 84 Q100 98 42 84Z" fill={C.red} />
          <Path d="M42 84 Q100 98 158 84 Q100 76 42 84Z" fill={C.cream} />
          <Circle cx={74} cy={56} r={9} fill={C.white} />
          <Circle cx={112} cy={44} r={11} fill={C.white} />
          <Circle cx={138} cy={66} r={6} fill={C.white} />
          <Circle cx={94} cy={72} r={5} fill={C.white} />
          <Path d="M58 60 C62 46 72 38 84 34" stroke={C.white} strokeWidth={4} opacity={0.3} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'friedEgg':
      return (
        <G>
          <Path d="M52 78 C40 66 56 50 70 54 C74 38 100 34 112 46 C130 38 152 52 146 68 C158 78 146 94 132 88 C120 96 104 90 98 84 C86 92 62 92 52 78Z" fill={C.white} />
          <Path d="M58 76 C52 68 60 60 68 62" stroke={C.silver} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx={102} cy={62} r={17} fill={C.gold} />
          <Circle cx={102} cy={62} r={17} fill="none" stroke={C.goldDeep} strokeWidth={2} opacity={0.5} />
          <Circle cx={96} cy={56} r={5} fill={C.goldLight} />
        </G>
      );
    case 'bucket':
      return (
        <G>
          <Path d="M66 80 L72 40 Q100 30 128 40 L134 80Z" fill={C.green} />
          <Path d="M42 92 Q52 72 66 76 Q100 86 134 76 Q148 72 158 92 Q100 106 42 92Z" fill={C.greenDeep} />
          <Path d="M68 70 Q100 79 132 70" stroke={C.white} strokeWidth={2.5} opacity={0.45} fill="none" strokeDasharray="5 5" strokeLinecap="round" />
          <Path d="M80 46 C84 42 90 40 96 39" stroke={C.white} strokeWidth={4} opacity={0.35} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'propeller':
      return (
        <G>
          <Path d="M58 84 C58 44 142 44 142 84Z" fill={C.blue} />
          <Path d="M100 46 C82 52 76 70 76 84 L100 84Z" fill={C.red} />
          <Path d="M100 46 C118 52 124 70 124 84 L100 84Z" fill={C.gold} />
          <Rect x={54} y={80} width={92} height={10} rx={5} fill={C.blueDeep} />
          <Rect x={98} y={28} width={4} height={18} rx={2} fill={C.ink} />
          <Ellipse cx={82} cy={28} rx={17} ry={5.5} fill={C.red} />
          <Ellipse cx={118} cy={28} rx={17} ry={5.5} fill={C.gold} />
          <Circle cx={100} cy={28} r={5} fill={C.ink} />
        </G>
      );
    case 'cowboy':
      return (
        <G>
          <Path d="M28 82 Q46 98 100 92 Q154 98 172 82 Q158 68 136 78 Q100 86 64 78 Q42 68 28 82Z" fill={C.brown} />
          <Path d="M66 80 C62 44 80 32 92 42 Q100 48 108 42 C120 32 138 44 134 80 Q100 88 66 80Z" fill={C.tan} />
          <Path d="M66 72 Q100 80 134 72 L134 80 Q100 88 66 80Z" fill={C.ink} />
          <Path d="M76 52 C78 46 84 44 88 46" stroke={C.white} strokeWidth={3.5} opacity={0.3} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'cherries':
      return (
        <G transform="translate(126 62) rotate(10)">
          <Path d="M10 -36 Q-6 -24 -8 -8 M10 -36 Q20 -22 17 -4" stroke={C.greenDeep} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M10 -36 Q24 -46 32 -34 Q20 -28 10 -36Z" fill={C.green} />
          <Circle cx={-8} cy={2} r={11} fill={C.red} />
          <Circle cx={17} cy={6} r={11} fill={C.red} />
          <Circle cx={-12} cy={-2} r={3} fill={C.white} opacity={0.6} />
          <Circle cx={13} cy={2} r={3} fill={C.white} opacity={0.6} />
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

// otter face anchors (pet.tsx)
const LX = 66;
const RX = 134;
const EY = 110;

function Heart({ x, y }: { x: number; y: number }) {
  return <Path d="M0 8 C-14 -2 -12 -14 -4 -14 C0 -14 0 -10 0 -10 C0 -10 0 -14 4 -14 C12 -14 14 -2 0 8Z" transform={`translate(${x} ${y + 2}) scale(1.35)`} />;
}

export function FaceArt({ id }: { id: FaceId }) {
  switch (id) {
    case 'shades':
      return (
        <G>
          <Rect x={LX - 21} y={EY - 11} width={42} height={23} rx={10} fill={C.black} />
          <Rect x={RX - 21} y={EY - 11} width={42} height={23} rx={10} fill={C.black} />
          <Path d={`M${LX + 21} ${EY - 5} Q100 ${EY - 10} ${RX - 21} ${EY - 5} M${LX - 21} ${EY - 5} L26 ${EY - 12} M${RX + 21} ${EY - 5} L174 ${EY - 12}`} stroke={C.black} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d={`M${LX - 14} ${EY - 5} L${LX - 4} ${EY - 5} M${RX - 14} ${EY - 5} L${RX - 4} ${EY - 5}`} stroke={C.white} strokeWidth={3} opacity={0.55} strokeLinecap="round" />
        </G>
      );
    case 'round':
      return (
        <G>
          <Circle cx={LX} cy={EY} r={17} fill={C.white} opacity={0.18} stroke={C.ink} strokeWidth={4} />
          <Circle cx={RX} cy={EY} r={17} fill={C.white} opacity={0.18} stroke={C.ink} strokeWidth={4} />
          <Path d={`M${LX + 17} ${EY - 3} Q100 ${EY - 9} ${RX - 17} ${EY - 3} M${LX - 17} ${EY - 3} L28 ${EY - 9} M${RX + 17} ${EY - 3} L172 ${EY - 9}`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'hearts':
      return (
        <G fill={C.red} opacity={0.92}>
          <Heart x={LX} y={EY} />
          <Heart x={RX} y={EY} />
          <Path d={`M${LX + 18} ${EY - 4} Q100 ${EY - 9} ${RX - 18} ${EY - 4}`} stroke={C.red} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'stars':
      return (
        <G>
          {[LX, RX].map((x) => (
            <Path
              key={x}
              d="M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6Z"
              transform={`translate(${x} ${EY})`}
              fill={C.gold}
              stroke={C.goldDeep}
              strokeWidth={2}
            />
          ))}
          <Path d={`M${LX + 18} ${EY - 4} Q100 ${EY - 9} ${RX - 18} ${EY - 4}`} stroke={C.goldDeep} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'mustache':
      // sits right under the nose, over the "w" mouth
      return (
        <Path
          d="M100 144 C94 138 82 138 76 146 C72 152 66 150 64 146 C66 156 80 158 90 152 C95 149 98 147 100 147 C102 147 105 149 110 152 C120 158 134 156 136 146 C134 150 128 152 124 146 C118 138 106 138 100 144Z"
          transform="translate(0 -18)"
          fill={C.brown}
        />
      );
    default:
      return null;
  }
}
