import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { useLook } from '@/features/closet/use-look';
import { nextStep, UNSTICK_STEPS } from '@/features/toolkit/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

import { Button, Card, toolStyles } from './parts';

const t = en.tools.unstick;

/**
 * Unstick me (task paralysis): one tiny physical first step, never the whole task.
 * "Get the body there before the brain is ready." Another one / I did it / add it as a bite.
 */
export function UnstickTool() {
  const { reduceMotion } = useTheme();
  const look = useLook();
  const addBites = useAppStore((s) => s.addBites);
  const startFocus = useAppStore((s) => s.startFocus);
  const [index, setIndex] = useState(() => nextStep(null));
  const [did, setDid] = useState(false);
  const step = UNSTICK_STEPS[index];
  const enter = reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast);

  return (
    <Screen back title={en.tools.tiles.unstick.title}>
      <Text variant="subhead" tone="ink2" style={toolStyles.intro}>{t.intro}</Text>

      <Card style={styles.card}>
        <Pet size={120} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood={did ? 'celebrating' : 'determined'} />
        <Animated.View key={`${index}-${did}`} entering={enter} accessibilityLiveRegion="polite">
          <Text variant="title2" style={styles.text} accessibilityLabel={`${t.label}: ${did ? t.yay : step}`}>{did ? t.yay : step}</Text>
        </Animated.View>
      </Card>

      {did ? (
        <>
          <Button label={t.keepGoing} icon="play" onPress={() => {
            haptics.medium();
            startFocus({ id: null, text: step, size: 0 }, 2, '2min');
            router.push('/focus');
          }} />
          <Button label={t.another} soft icon="repeat" onPress={() => { setDid(false); setIndex((i) => nextStep(i)); haptics.select(); }} />
        </>
      ) : (
        <>
          <Button label={t.did} icon="check" onPress={() => { setDid(true); haptics.success(); play('spark'); }} />
          <Button label={t.another} soft icon="repeat" onPress={() => { setIndex((i) => nextStep(i)); haptics.select(); play('tick'); }} />
          <Button label={t.add} soft icon="plus" onPress={() => {
            addBites([{ text: step, size: 0 }]);
            haptics.light();
            play('pop');
            toast(t.added);
          }} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: space.l, paddingVertical: space.xl },
  text: { textAlign: 'center' },
});
