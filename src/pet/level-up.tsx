import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { rewardsFor, SLOT_ICON, type Item } from '@/features/closet/items';
import { useLook } from '@/features/closet/use-look';
import { MAX_LEVEL, STAGES } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { radius, roomGradients, space } from '@/theme/tokens';

import { Burst } from './burst';
import { Pet } from './pet';
import type { FaceId, HatId } from './wardrobe';

const t = en.levelUp;
const STAGE_AT: Record<number, string> = Object.fromEntries(STAGES.map((s) => [s.level, s.name]));

/**
 * Level-up card (Anass 2026-11-07: levels should feel like a reveal). Shows once per level:
 * what you unlocked, previewed on the pet, with "Wear it". Level 20 is the final surprise:
 * the Legend form and its golden gifts. Spring in from 0.92 (never from 0), sparkle burst,
 * success haptic + sound on the same frame. Reduce Motion: a plain fade.
 */
export function LevelUp({ level, onDone }: { level: number | null; onDone: () => void }) {
  return (
    <Modal visible={level !== null} transparent animationType="fade" onRequestClose={onDone} statusBarTranslucent navigationBarTranslucent>
      {level !== null ? <Card level={level} onDone={onDone} /> : null}
    </Modal>
  );
}

function Card({ level, onDone }: { level: number; onDone: () => void }) {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const pet = useAppStore((s) => s.pet);
  const patchPet = useAppStore((s) => s.patchPet);
  const [burst, setBurst] = useState(0);
  const legend = level >= MAX_LEVEL;
  const reward = rewardsFor(level, STAGE_AT);
  const wearable = reward.items.find((i) => i.slot === 'hat' || i.slot === 'face' || i.slot === 'color' || i.slot === 'room');

  useEffect(() => {
    const id = setTimeout(() => {
      setBurst(1);
      haptics.success();
      play('spark');
    }, reduceMotion ? 0 : 260);
    return () => clearTimeout(id);
  }, [reduceMotion]);

  // preview the new item on the pet before it's worn
  const hat = (legend ? 'goldCrown' : wearable?.slot === 'hat' ? wearable.id : look.hat) as HatId;
  const face = (wearable?.slot === 'face' ? wearable.id : look.face) as FaceId;
  const color = legend ? 'gold' : wearable?.slot === 'color' ? (wearable.id as typeof look.color) : look.color;

  const wear = () => {
    if (legend) patchPet({ hat: 'goldCrown', color: 'gold', room: 'golden' });
    else if (wearable) patchPet({ [wearable.slot]: wearable.id } as Partial<typeof pet>);
    haptics.medium();
    play('pop');
    onDone();
  };

  const enter = reduceMotion ? FadeIn.duration(200) : ZoomIn.springify().damping(18).stiffness(220).withInitialValues({ transform: [{ scale: 0.92 }] });

  return (
    <View style={[styles.scrim, { backgroundColor: colors.scrim }]}>
      <Animated.View entering={enter} style={[styles.card, { backgroundColor: colors.cardSolid, borderColor: colors.cardBorder }]}>
        <View style={styles.hero}>
          <LinearGradient colors={legend ? roomGradients.golden : roomGradients.sunset} style={StyleSheet.absoluteFill} />
          <Burst id={burst} size={260} />
          <Pet size={128} color={color} mood="celebrating" stage={legend ? 4 : look.stage} hat={hat} face={face} still />
        </View>

        <View style={styles.body}>
          {legend ? (
            <>
              <Text variant="caption" tone="primary" style={styles.kicker}>{t.legendTitle}</Text>
              <Text variant="title" style={styles.center}>{t.title(level)}</Text>
              <Text variant="body" tone="ink2" style={styles.center}>{t.legendSub(pet.name)}</Text>
              <View style={styles.list}>
                {t.legendGifts.map((g) => (
                  <Text key={g} variant="bodyBold" style={styles.center}>{g}</Text>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text variant="title" style={styles.center}>{t.title(level)}</Text>
              {reward.stageName ? <Text variant="bodyBold" tone="primary" style={styles.center}>{t.evolved(reward.stageName)}</Text> : null}
              {reward.items.length ? (
                <View style={styles.list}>
                  <Text variant="caption" tone="ink2" style={styles.center}>{t.unlocked}</Text>
                  {reward.items.map((i: Item) => (
                    <View key={i.id} style={styles.rewardRow}>
                      <View style={[styles.rewardIcon, { backgroundColor: colors.primarySoft }]}>
                        <Icon name={SLOT_ICON[i.slot]} size={16} color={colors.primaryInk} />
                      </View>
                      <Text variant="heading">{i.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text variant="body" tone="ink2" style={styles.center}>{t.nothing}</Text>
              )}
            </>
          )}

          <View style={styles.actions}>
            {legend || wearable ? (
              <PressScale accessibilityRole="button" onPress={wear} style={[styles.btn, { backgroundColor: colors.primary }]}>
                <Text variant="bodyBold" tone="onPrimary">{legend ? t.legendCta : t.wear}</Text>
              </PressScale>
            ) : null}
            <PressScale accessibilityRole="button" onPress={onDone} style={[styles.btn, { backgroundColor: colors.fill }]}>
              <Text variant="bodyBold">{t.nice}</Text>
            </PressScale>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: { width: '100%', maxWidth: 380, borderRadius: radius.sheet, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  hero: { height: 220, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { padding: space.xl, gap: space.s },
  center: { textAlign: 'center' },
  kicker: { textAlign: 'center', letterSpacing: 2, fontWeight: '700' },
  list: { gap: space.xs, marginTop: space.s },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s },
  rewardIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: space.s, marginTop: space.l },
  btn: { minHeight: 52, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
