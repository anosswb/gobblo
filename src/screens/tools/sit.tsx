import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Chips } from '@/components/settings-parts';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { useSafeKeepAwake } from '@/hooks/use-safe-keep-awake';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play, startLoop, stopLoop } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { space } from '@/theme/tokens';

import { Button, Card, toolStyles } from './parts';

const t = en.tools.sit;
type Length = '10' | '25' | '45' | 'open';
const CHECK_IN_S = 10 * 60;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Runs only while sitting: keeps the screen on and plays the user's focus sound, if any. */
function Session() {
  useSafeKeepAwake('sit');
  useEffect(() => {
    const sound = useAppStore.getState().settings.focusSound;
    if (sound !== 'none') startLoop(sound);
    return () => stopLoop();
  }, []);
  return null;
}

/**
 * Sit with me (body doubling, docs/07 #4): the pet works next to you. No task, no sparks, no
 * video. A soft tap every 10 minutes ("still here"), a wall-clock timer that survives slow frames.
 */
export function SitTool() {
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const [length, setLength] = useState<Length>('25');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [summary, setSummary] = useState<string | null>(null);

  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const total = length === 'open' ? null : Number(length) * 60;
  const left = total === null ? null : Math.max(0, total - elapsed);
  const checkIn = Math.floor(elapsed / CHECK_IN_S);

  const finish = (secs: number) => {
    const min = Math.round(secs / 60);
    setStartedAt(null);
    setSummary(min >= 1 ? t.done(min) : t.doneShort);
    haptics.success();
    play('chime');
  };

  // one tick a second; the time comes from the wall clock, not from counting ticks
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const secs = Math.floor((n - startedAt) / 1000);
      if (total !== null && secs >= total) finish(total);
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, total]);

  // the soft check-in every 10 minutes
  useEffect(() => {
    if (startedAt && checkIn > 0) haptics.light();
  }, [checkIn, startedAt]);

  const sitting = startedAt !== null;
  const line = sitting && checkIn > 0 ? t.checkIns[(checkIn - 1) % t.checkIns.length] : t.working(petName);

  return (
    <Screen back title={en.tools.tiles.sit.title}>
      {sitting ? <Session /> : null}
      <Text variant="subhead" tone="ink2" style={toolStyles.intro}>{t.intro(petName)}</Text>

      <Card style={styles.card}>
        <Pet size={150} color={look.color} stage={look.stage} hat={look.hat} face={look.face}
          mood={sitting ? 'focused' : summary ? 'love' : 'happy'} working={sitting} headphones={sitting} />
        <View style={toolStyles.center} accessibilityLiveRegion="polite">
          {sitting ? (
            <>
              <Text variant="timer" accessibilityLabel={left !== null ? `${clock(left)} ${t.left}` : `${clock(elapsed)} ${t.together}`}>
                {clock(left ?? elapsed)}
              </Text>
              <Text variant="caption" tone="ink2">{left !== null ? t.left : t.together}</Text>
              <Animated.View key={line} entering={FadeIn.duration(duration.fast)}>
                <Text variant="subhead" style={styles.text}>{line}</Text>
              </Animated.View>
            </>
          ) : (
            <Text variant="title2" style={styles.text}>{summary ?? t.howLong}</Text>
          )}
        </View>
      </Card>

      {sitting ? (
        <Button label={t.stop} soft onPress={() => finish(elapsed)} />
      ) : (
        <>
          <Chips<Length>
            accessibilityLabel={t.howLong}
            value={length}
            onChange={(v) => { setLength(v); haptics.select(); }}
            options={[{ value: '10', label: '10 min' }, { value: '25', label: '25 min' }, { value: '45', label: '45 min' }, { value: 'open', label: t.open }]}
          />
          <Button label={t.start} icon="people" onPress={() => {
            const n = Date.now();
            setNow(n);
            setStartedAt(n);
            setSummary(null);
            haptics.medium();
            play('pop');
          }} />
          <Text variant="caption" tone="ink3" style={styles.text}>{t.soundHint}</Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: space.m, paddingVertical: space.xl },
  text: { textAlign: 'center' },
});
