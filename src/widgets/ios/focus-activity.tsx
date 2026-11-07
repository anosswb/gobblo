'use no memo'; // runs in the isolated widget runtime: no React Compiler, no hooks

import { HStack, Image, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { activityBackgroundTint, font, foregroundStyle, frame, lineLimit, monospacedDigit, padding, tint } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

export type FocusActivityProps = {
  petName: string;
  biteText: string;
  /** SF Symbol for the bite */
  symbol: string;
  /** ms since epoch (props travel as JSON, so no Date objects) */
  startedAt: number;
  endsAt: number;
  /** ms left when paused, else null */
  pausedLeft: number | null;
};

/**
 * Start Kit #2 on iOS: the focus timer on the Lock Screen and in the Dynamic Island.
 * SwiftUI counts down by itself (Text timerInterval), so no updates are needed while it runs.
 */
const FocusActivity = (p: FocusActivityProps, env: LiveActivityEnvironment) => {
  'widget';
  const pink = env.isLuminanceReduced ? '#FFFFFF' : '#FF4F96';
  const lime = env.isLuminanceReduced ? '#FFFFFF' : '#C6F432';
  const range = { lower: new Date(p.startedAt), upper: new Date(p.endsAt) };
  const paused = p.pausedLeft !== null;
  const pausedMin = paused ? Math.max(1, Math.ceil((p.pausedLeft ?? 0) / 60000)) : 0;

  const clock = (size: number) =>
    paused ? (
      <Text modifiers={[font({ size, weight: 'semibold', design: 'rounded' }), foregroundStyle(pink)]}>{`${pausedMin}m`}</Text>
    ) : (
      <Text
        timerInterval={range}
        countsDown
        modifiers={[font({ size, weight: 'semibold', design: 'rounded' }), monospacedDigit(), foregroundStyle(pink), frame({ maxWidth: size * 3.2 })]}
      />
    );

  return {
    banner: (
      <VStack spacing={10} modifiers={[padding({ all: 16 }), activityBackgroundTint('#0B0A1A')]}>
        <HStack spacing={12}>
          <Image systemName={p.symbol as never} size={28} color={pink} />
          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle('#AEAEB2')]}>
              {paused ? `${p.petName} is waiting` : `${p.petName} is working with you`}
            </Text>
            <Text modifiers={[font({ size: 17, weight: 'bold' }), foregroundStyle('#FFFFFF'), lineLimit(1)]}>{p.biteText}</Text>
          </VStack>
          <Spacer />
          {clock(30)}
        </HStack>
        {paused ? null : <ProgressView timerInterval={range} countsDown modifiers={[tint(lime)]} />}
      </VStack>
    ),
    compactLeading: <Image systemName={p.symbol as never} color={pink} />,
    compactTrailing: clock(14),
    minimal: <Image systemName={p.symbol as never} color={pink} />,
    expandedLeading: (
      <VStack alignment="leading" modifiers={[padding({ leading: 4 })]}>
        <Image systemName={p.symbol as never} size={24} color={pink} />
      </VStack>
    ),
    expandedTrailing: clock(26),
    expandedCenter: (
      <Text modifiers={[font({ size: 15, weight: 'bold' }), lineLimit(1)]}>{p.biteText}</Text>
    ),
    expandedBottom: paused ? (
      <Text modifiers={[font({ size: 13 }), foregroundStyle('#AEAEB2')]}>Paused. Tap to come back.</Text>
    ) : (
      <ProgressView timerInterval={range} countsDown modifiers={[tint(lime)]} />
    ),
  };
};

export const FocusActivityIOS = createLiveActivity<FocusActivityProps>('FocusActivity', FocusActivity);
export default FocusActivityIOS;
