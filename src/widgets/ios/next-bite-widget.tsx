'use no memo'; // runs in the isolated widget runtime: no React Compiler, no hooks

import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
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
  emoji: string;
  minutes: number;
  left: number;
  canStart: boolean;
  /** deep links are built in the app (Linking.createURL) and passed in: the widget can't import */
  startUrl: string;
  openUrl: string;
};

/**
 * iOS widget "Next bite" (Start Kit, docs/13 §7). Home screen (small, medium) and Lock Screen
 * (rectangular, circular). Everything it uses must be declared inside the function ('widget').
 */
const NextBite = (p: NextBiteProps, env: WidgetEnvironment) => {
  'widget';
  const dark = env.colorScheme === 'dark';
  const tint = dark ? '#FF4F96' : '#E5307D';
  const ink = dark ? '#FFFFFF' : '#1C1C1E';
  const ink2 = dark ? '#AEAEB2' : '#6C6C70';
  const bg = dark ? '#1C1C1E' : '#FFFFFF';
  const url = p.biteText && p.canStart ? p.startUrl : p.openUrl;
  const family = env.widgetFamily;

  if (family === 'accessoryCircular') {
    return (
      <VStack modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}>
        <Text modifiers={[font({ size: 22 })]}>{p.biteText ? p.emoji : '🍽️'}</Text>
        <Text modifiers={[font({ size: 11, weight: 'semibold' })]}>{p.left > 0 ? String(p.left) : '0'}</Text>
      </VStack>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" modifiers={[containerBackground('clear', 'widget'), widgetURL(url)]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' })]}>{p.petName} is hungry</Text>
        <Text modifiers={[font({ size: 15, weight: 'bold' }), lineLimit(1)]}>
          {p.biteText ? `${p.emoji} ${p.biteText}` : 'Plate is empty'}
        </Text>
        <Text modifiers={[font({ size: 12 })]}>{p.biteText && p.canStart ? 'Tap: start 2 min' : `${p.left} on your plate`}</Text>
      </VStack>
    );
  }

  const title = (
    <VStack alignment="leading" spacing={4}>
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(ink2)]}>
        {p.biteText ? `${p.petName} is hungry for` : `${p.petName}’s plate is empty`}
      </Text>
      <Text modifiers={[font({ size: 17, weight: 'bold', design: 'rounded' }), foregroundStyle(ink), lineLimit(2)]}>
        {p.biteText ? `${p.emoji} ${p.biteText}` : 'Tap to dump your brain'}
      </Text>
    </VStack>
  );

  const pill = p.biteText ? (
    <Text
      modifiers={[
        font({ size: 14, weight: 'bold' }),
        foregroundStyle(p.canStart ? '#FFFFFF' : ink),
        padding({ horizontal: 12, vertical: 7 }),
        background(p.canStart ? tint : dark ? '#2C2C2E' : '#F2F2F7', shapes.capsule()),
      ]}>
      {p.canStart ? '▶ Start 2 min' : `Open · ${p.left} bites`}
    </Text>
  ) : null;

  if (family === 'systemMedium') {
    return (
      <HStack spacing={14} modifiers={[containerBackground(bg, 'widget'), widgetURL(url)]}>
        <Text modifiers={[font({ size: 54 })]}>{p.biteText ? p.emoji : '🍽️'}</Text>
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
      <Text modifiers={[font({ size: 30 })]}>{p.biteText ? p.emoji : '🍽️'}</Text>
      {title}
      <Spacer />
      {pill}
    </VStack>
  );
};

export const NextBiteIOS = createWidget<NextBiteProps>('NextBite', NextBite, {
  petName: 'Bean',
  biteText: null,
  emoji: '🍬',
  minutes: 2,
  left: 0,
  canStart: false,
  startUrl: 'gobblo://',
  openUrl: 'gobblo://',
});
export default NextBiteIOS;
