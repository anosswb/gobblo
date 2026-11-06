import { SymbolView, type SymbolWeight } from 'expo-symbols';
import {
  ArrowsClockwise,
  Bell,
  CaretLeft,
  CaretRight,
  Check,
  DiceFive,
  Export,
  GearSix,
  House,
  type IconProps,
  Moon,
  Pause,
  Play,
  Plus,
  Smiley,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  Timer,
  Trash,
  TShirt,
  X,
} from 'phosphor-react-native';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';

/**
 * SF Symbols on iOS (the real Apple glyphs, weight-matched to the text next to them);
 * Phosphor on Android + web, which is the closest open set in shape and stroke.
 */
const MAP = {
  home: ['house.fill', House],
  spin: ['dice.fill', DiceFive],
  closet: ['tshirt.fill', TShirt],
  me: ['face.smiling.inverse', Smiley],
  plus: ['plus', Plus],
  gear: ['gearshape.fill', GearSix],
  back: ['chevron.left', CaretLeft],
  chevron: ['chevron.right', CaretRight],
  close: ['xmark', X],
  repeat: ['arrow.clockwise', ArrowsClockwise],
  trash: ['trash', Trash],
  sparkle: ['sparkle', Sparkle],
  play: ['play.fill', Play],
  pause: ['pause.fill', Pause],
  sound: ['speaker.wave.2.fill', SpeakerHigh],
  mute: ['speaker.slash.fill', SpeakerSlash],
  share: ['square.and.arrow.up', Export],
  check: ['checkmark', Check],
  bell: ['bell.fill', Bell],
  moon: ['moon.fill', Moon],
  timer: ['timer', Timer],
} as const satisfies Record<string, readonly [string, ComponentType<IconProps>]>;

export type IconName = keyof typeof MAP;

const PHOSPHOR_WEIGHT: Record<'regular' | 'semibold' | 'bold', IconProps['weight']> = {
  regular: 'regular',
  semibold: 'bold',
  bold: 'bold',
};

export function Icon({
  name,
  size = 22,
  color,
  weight = 'semibold',
  filled = true,
}: {
  name: IconName;
  size?: number;
  color: string;
  weight?: 'regular' | 'semibold' | 'bold';
  /** Phosphor only: fill the shape (SF names already carry .fill) */
  filled?: boolean;
}) {
  const [sf, Fallback] = MAP[name];
  if (Platform.OS === 'ios') {
    return <SymbolView name={sf as never} size={size} tintColor={color} weight={weight as SymbolWeight} resizeMode="scaleAspectFit" style={{ width: size, height: size }} />;
  }
  const solid = filled && sf.endsWith('.fill');
  return <Fallback size={size} color={color} weight={solid ? 'fill' : PHOSPHOR_WEIGHT[weight]} />;
}
