import { useState } from 'react';
import { GuideHelp } from '@/components/guide/page-guide';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Row, Section } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { useLook } from '@/features/closet/use-look';
import { TIPS, tipForDay } from '@/features/toolkit/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { dayKey } from '@/state/schema';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

import { Button, Card, toolStyles } from './parts';

const t = en.tools.tip;

/** Daily tip: one everyday, non-medical tip per pet day (turns over at 4 am). Save + share. */
export function TipTool() {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const [tip] = useState(() => tipForDay(dayKey()));
  const savedIds = useAppStore((s) => s.savedTips);
  const toggle = useAppStore((s) => s.toggleSavedTip);
  const isSaved = savedIds.includes(tip.id);
  const saved = savedIds.map((id) => TIPS.find((x) => x.id === id)).filter((x): x is (typeof TIPS)[number] => !!x);
  const exit = FadeOut.duration(duration.quick);

  return (
    <Screen back title={en.tools.tiles.tip.title} right={<GuideHelp id="tip" auto />}>
      <Card style={styles.hero}>
        <View style={styles.head}>
          <Pet size={64} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood="excited" />
          <Text variant="caption" tone="primary" style={styles.kicker}>{t.today}</Text>
        </View>
        <Text variant="heading">{tip.text}</Text>
        <Text variant="caption" tone="ink2">{t.newTomorrow}</Text>
      </Card>

      <View style={toolStyles.row}>
        <View style={toolStyles.flex}>
          <Button
            label={isSaved ? t.saved : t.save}
            icon={isSaved ? 'check' : 'star'}
            soft={isSaved}
            onPress={() => {
              toggle(tip.id);
              if (!isSaved) {
                haptics.success();
                play('pop');
                toast(t.toastSaved);
              } else haptics.light();
            }}
          />
        </View>
        <View style={toolStyles.flex}>
          <Button label={t.share} icon="share" soft onPress={() => { haptics.light(); void Share.share({ message: t.shareText(tip.text) }).catch(() => undefined); }} />
        </View>
      </View>

      <Section title={t.savedTitle}>
        {saved.length === 0 ? (
          <Row last label={t.savedEmpty} />
        ) : (
          saved.map((s, i) => (
            <Animated.View key={s.id} entering={FadeIn.duration(duration.fast)} exiting={exit} layout={reduceMotion ? undefined : LinearTransition}>
              <Row
                last={i === saved.length - 1}
                label={s.text}
                right={
                  <PressScale accessibilityRole="button" accessibilityLabel={t.remove(s.text)} hitSlop={12} onPress={() => { haptics.light(); toggle(s.id); }}>
                    <Icon name="trash" size={20} color={colors.ink3} />
                  </PressScale>
                }
              />
            </Animated.View>
          ))
        )}
      </Section>

      <Text variant="caption" tone="ink3" style={styles.disclaimer}>{t.disclaimer}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.m, paddingVertical: space.xl },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  kicker: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  disclaimer: { paddingHorizontal: space.xs, textAlign: 'center' },
});
