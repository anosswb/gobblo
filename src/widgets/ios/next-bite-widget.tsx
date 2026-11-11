'use no memo'; // runs in the isolated widget runtime: no React Compiler, no hooks

import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  shapes,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type NextBiteProps = {
  petName: string;
  biteText: string | null;
  /** SF Symbol for the bite (src/features/bites/bite-icon.ts) */
  symbol: string;
  minutes: number;
  left: number;
  /** deep links are built in the app (Linking.createURL) and passed in: the widget can't import */
  startUrl: string;
  openUrl: string;
};

/**
 * iOS widget "Next bite" (docs/13 §7). Home screen (small, medium) and Lock Screen
 * (rectangular, circular). Everything it uses must be declared inside the function ('widget').
 */
const NextBite = (p: NextBiteProps, env: WidgetEnvironment) => {
  'widget';
  const dark = env.colorScheme === 'dark';
  const tint = dark ? '#FFD166' : '#003459';
  const ink = dark ? '#FBEEDD' : '#00171F';
  const ink2 = dark ? '#A9C0CF' : '#5E6F78';
  const bg = dark ? '#003459' : '#FBEEDD';
  const url = p.biteText ? p.startUrl : p.openUrl;
  const family = env.widgetFamily;

  if (family === 'accessoryCircular') {
    return (
      <VStack modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}>
        <Image systemName={(p.biteText ? p.symbol : 'fork.knife') as never} size={20} />
        <Text modifiers={[font({ size: 11, weight: 'semibold' })]}>{p.left > 0 ? String(p.left) : '0'}</Text>
      </VStack>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' })]}>{p.petName} is hungry</Text>
        <Text modifiers={[font({ size: 15, weight: 'bold' }), lineLimit(1)]}>
          {p.biteText ?? 'Plate is empty'}
        </Text>
        <Text modifiers={[font({ size: 12 })]}>{p.biteText ? 'Tap: start 2 min' : `${p.left} on your plate`}</Text>
      </VStack>
    );
  }

  const title = (
    <VStack alignment="leading" spacing={4}>
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(ink2)]}>
        {p.biteText ? `${p.petName} is hungry for` : `${p.petName}’s plate is empty`}
      </Text>
      <Text modifiers={[font({ size: 17, weight: 'bold', design: 'rounded' }), foregroundStyle(ink), lineLimit(2)]}>
        {p.biteText ?? 'Tap to dump your brain'}
      </Text>
    </VStack>
  );

  const pill = p.biteText ? (
    <Text
      modifiers={[
        font({ size: 14, weight: 'bold' }),
        foregroundStyle(dark ? '#00171F' : '#FBEEDD'),
        padding({ horizontal: 12, vertical: 7 }),
        background(tint, shapes.capsule()),
      ]}>
      ▶ Start 2 min
    </Text>
  ) : null;

  if (family === 'systemMedium') {
    return (
      <HStack spacing={14} modifiers={[containerBackground(bg, 'widget'), widgetURL(url)]}>
        <Image systemName={(p.biteText ? p.symbol : 'fork.knife') as never} size={40} color={tint} />
        <VStack alignment="leading" spacing={10}>
          {title}
          {pill}
        </VStack>
        <Spacer />
      </HStack>
    );
  }

  // systemSmall (default)
  return (
    <VStack alignment="leading" spacing={8} modifiers={[containerBackground(bg, 'widget'), widgetURL(url), frame({ maxWidth: 400, maxHeight: 400, alignment: 'topLeading' })]}>
      <Image systemName={(p.biteText ? p.symbol : 'fork.knife') as never} size={26} color={tint} />
      {title}
      <Spacer />
      {pill}
    </VStack>
  );
};

export const NextBiteIOS = createWidget<NextBiteProps>('NextBite', NextBite, {
  petName: 'Bean',
  biteText: null,
  symbol: 'fork.knife',
  minutes: 2,
  left: 0,
  startUrl: 'gobblo://',
  openUrl: 'gobblo://',
});
export default NextBiteIOS;
