import Constants from 'expo-constants';
import { GuideHelp } from '@/components/guide/page-guide';
import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { IconTile, Row, Section } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { STAGES } from '@/features/progress/logic';
import { haptics } from '@/lib/haptics';
import { PLUS_VISIBLE } from '@/config/monetization';
import { en } from '@/i18n/en';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { PAGE_TILE, type PageId } from './pages';

const t = en.settings;

/**
 * Settings, iOS 26 style (Anass 2026-11-08: "looks like iPhone 6 settings"): a pet card on top
 * (like the Apple Account card), then one row per topic with its coloured tile, the current value
 * and a chevron. Each topic opens its own page (./pages.tsx) instead of one long form.
 */
export function SettingsScreen() {
  const { colors } = useTheme();
  const s = useAppStore((st) => st.settings);
  const pet = useAppStore((st) => st.pet);
  const look = useLook();

  const open = (id: PageId) => {
    haptics.select();
    router.push(`/settings/${id}` as Href);
  };
  const row = (id: PageId, value?: string, last = false) => (
    <Row key={id} leading={<IconTile name={PAGE_TILE[id].icon} color={PAGE_TILE[id].color} />} label={t.pages[id]} value={value} last={last} onPress={() => open(id)} />
  );

  const theme = s.theme === 'system' ? t.system : s.theme === 'light' ? t.light : t.dark;
  const nudge = s.nudge === 'off' ? t.off : capWord(s.nudge);

  return (
    <Screen back title={t.title} right={<GuideHelp id="settings" />}>
      {/* the pet card: who this app belongs to */}
      <PressScale accessibilityRole="button" accessibilityLabel={`${pet.name}, ${t.petCardHint}`} onPress={() => open('pet')}
        style={[styles.petCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.avatar, { backgroundColor: colors.fill }]}>
          <Pet size={52} still color={look.color} hat={look.hat} face={look.face} stage={look.stage} mood="happy" />
        </View>
        <View style={styles.flex}>
          <Text variant="heading" numberOfLines={1}>{pet.name}</Text>
          <Text variant="subhead" tone="ink2">{t.petCard(look.level, STAGES[look.stage].name)}</Text>
          <Text variant="caption" tone="ink2">{t.petCardHint}</Text>
        </View>
        <Icon name="chevron" size={14} weight="bold" color={colors.ink3} />
      </PressScale>

      {PLUS_VISIBLE ? (
        <Section>
          <Row leading={<IconTile name="sparkle" color="pink" />} last label={en.plus.settingsRow} onPress={() => router.push('/plus')} />
        </Section>
      ) : null}

      <Section>
        {row('look', theme)}
        {row('sound', s.sound ? t.on : t.off)}
        {row('nudges', nudge)}
        {row('focus', t.minutes(s.defaultTimer), true)}
      </Section>

      <Section>
        {row('time', s.clock24h ? t.h24 : t.h12)}
        {row('privacy', s.biometricLock ? t.locked : undefined)}
        {row('about', Constants.expoConfig?.version, true)}
      </Section>

      <Section>
        {row('faq', undefined, true)}
      </Section>
    </Screen>
  );
}

/** "gentle · 1/day" → "Gentle" (the short form for the value column) */
const capWord = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 1 },
  petCard: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
