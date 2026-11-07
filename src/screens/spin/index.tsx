import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { FOOD, plate } from '@/features/bites/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useLook } from '@/features/closet/use-look';
import { Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import type { Size } from '@/state/schema';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { Drum, type DrumHandle, type DrumItem } from './drum';
import type { IconName } from '@/components/icon';

const sp = en.spin;
type Choice = DrumItem & { biteId: string | null; size: Size };

/**
 * Spin (docs/01 §6, choice paralysis). Your bites (up to 8) on an iOS picker drum, padded with
 * 5-minute "snacks". It rolls, ticks slower and slower, lands; one button starts it for 2 min.
 */
export function SpinScreen() {
  const { colors, reduceMotion } = useTheme();
  const pet = useAppStore((s) => s.pet);
  const look = useLook();
  const stage = look.stage;
  const bites = useAppStore((s) => s.bites);
  const startFocus = useAppStore((s) => s.startFocus);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const lastTick = useRef(0);
  const drum = useRef<DrumHandle>(null);

  const mine: Choice[] = plate(bites, undefined)
    .slice(0, 8)
    .map((b) => ({ key: b.id, emoji: FOOD[b.size].icon, text: b.text, biteId: b.id, size: b.size }));
  const snacks: Choice[] = sp.snacks.map((s, i) => ({ key: `snack-${i}`, emoji: s.icon as IconName, text: s.text, biteId: null, size: 0 as Size }));
  const items: Choice[] = mine.length >= 6 ? mine : [...mine, ...snacks.slice(0, Math.max(6 - mine.length, mine.length ? 2 : 6))];
  const pick = landed !== null ? items[landed] : null;
  const mood: Mood = spinning ? 'excited' : pick ? 'proud' : 'curious';

  const spin = () => {
    if (spinning) return;
    setLanded(null);
    setSpinning(true);
    haptics.medium();
    play('pop');
    drum.current?.spin(Math.floor(Math.random() * items.length));
  };

  const start = () => {
    if (!pick) return;
    startFocus({ id: pick.biteId, text: pick.text, size: pick.size }, 2, '2min');
    haptics.medium();
    play('spark');
    router.push('/focus');
    setTimeout(() => toast(en.focus.started), 450);
  };

  return (
    <Screen eyebrow={sp.eyebrow} title={sp.title}>
      <View style={[styles.card, { backgroundColor: colors.cardSolid, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.head}>
          <Pet size={72} color={look.color} hat={look.hat} face={look.face} mood={mood} stage={stage} />
          <Text variant="subhead" tone="ink2" style={styles.flex}>
            {mine.length ? sp.sub(pet.name) : sp.snacksOnly}
          </Text>
        </View>

        <Drum
          ref={drum}
          items={items}
          onTick={() => {
            const now = Date.now();
            if (now - lastTick.current < 45) return; // keep the fast start from buzzing
            lastTick.current = now;
            haptics.select();
            play('tick');
          }}
          onLand={(i) => {
            setSpinning(false);
            setLanded(i);
            haptics.success();
            play('spark');
          }}
        />

        {pick && !spinning ? (
          <Animated.View entering={reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast)} style={styles.result}>
            <Text variant="caption" tone="primary" style={styles.kicker}>{sp.landed}</Text>
            <PressScale accessibilityRole="button" accessibilityLabel={`${sp.start}: ${pick.text}`} onPress={start} style={[styles.primary, { backgroundColor: colors.primary }]}>
              <Icon name="play" size={16} color={colors.onPrimary} />
              <Text variant="bodyBold" tone="onPrimary">{sp.start}</Text>
            </PressScale>
            <PressScale accessibilityRole="button" onPress={spin} style={[styles.secondary, { backgroundColor: colors.fill }]}>
              <Text variant="bodyBold">{sp.again}</Text>
            </PressScale>
          </Animated.View>
        ) : (
          <PressScale
            accessibilityRole="button"
            accessibilityState={{ busy: spinning }}
            onPress={spin}
            style={[styles.primary, { backgroundColor: spinning ? colors.fill : colors.primary }]}>
            <Icon name="spin" size={18} color={spinning ? colors.ink3 : colors.onPrimary} />
            <Text variant="bodyBold" tone={spinning ? 'ink3' : 'onPrimary'}>{sp.spin}</Text>
          </PressScale>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radius.card, paddingVertical: space.l, paddingHorizontal: space.l, gap: space.m },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  result: { gap: space.s },
  kicker: { textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  primary: { minHeight: 54, borderRadius: radius.button, flexDirection: 'row', gap: space.s, alignItems: 'center', justifyContent: 'center' },
  secondary: { minHeight: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
