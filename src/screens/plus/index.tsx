import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { LINKS } from '@/config/app';
import { MONETIZATION } from '@/config/monetization';
import { askNotificationPermission } from '@/features/nudges/schedule';
import { canShowOffer, hasPack, PACKS, SHOWN_PACK_IDS, type PackId } from '@/features/plus/catalog';
import { ROUTINE_IDS, ROUTINES, type RoutineId } from '@/features/plus/routines';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { addWidgetToHomeScreen, widgetsSupported } from '@/widgets/update';
import { radius, space } from '@/theme/tokens';
import { Icon } from '@/components/icon';

const t = en.plus;
/** dev app + the GitHub preview APK (testers): a button to unlock everything. Never in store builds. */
const TEST_BUILD = __DEV__ || Constants.expoConfig?.extra?.variant === 'preview';

/**
 * Gobblo Plus (docs/13). Opened only by the user (Settings, Closet): never a pop-up, never in
 * onboarding, never in the core loop (CLAUDE.md). Android: packs cost sparks. iOS: App Store
 * purchases arrive in Phase 6 (RevenueCat); until they work, iPhone users never reach this page
 * (PLUS_VISIBLE) and no price is shown here (hide, don't fake).
 */
export function PlusScreen() {
  const { colors } = useTheme();
  const unlocked = useAppStore((s) => s.unlocked);
  const sparks = useAppStore((s) => s.stats.sparks);
  const firstOpen = useAppStore((s) => s.settings.firstOpen);
  const buyWithSparks = useAppStore((s) => s.buyPackWithSparks);
  const addBites = useAppStore((s) => s.addBites);
  const toggleDaily = useAppStore((s) => s.toggleDaily);
  const unlock = useAppStore((s) => s.unlock);
  const android = MONETIZATION === 'ads';

  const unlockPack = (id: PackId) => {
    if (buyWithSparks(id)) {
      // the lock-screen timer is a notification: ask once, right when it becomes useful
      if (id === 'startKit') void askNotificationPermission().catch(() => false);
      haptics.success();
      play('spark');
      toast(t.unlocked(t.packs[id].name));
    } else {
      haptics.warning();
      play('nope');
      toast(t.needSparks(sparks, PACKS[id].sparks));
    }
  };

  const addRoutine = (id: RoutineId) => {
    const ids = addBites(ROUTINES[id].bites);
    ids.forEach(toggleDaily);
    haptics.success();
    play('pop');
    toast(t.routineAdded(t.routineNames[id], ids.length));
  };

  return (
    <Screen back glow={false} eyebrow={t.eyebrow} title={t.title}>
      <Text variant="body" tone="ink2">{android ? t.introAndroid : t.intro}</Text>
      {!canShowOffer(firstOpen) ? (
        <View style={[styles.note, { backgroundColor: colors.fill }]}>
          <Text variant="subhead">{t.weekOne}</Text>
        </View>
      ) : null}

      {SHOWN_PACK_IDS.map((id) => {
        const owned = hasPack(unlocked, id);
        const p = t.packs[id];
        return (
          <View key={id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.head}>
              <View style={[styles.packIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon name={PACKS[id].icon} size={20} color={colors.primary} />
              </View>
              <Text variant="heading" style={styles.flex}>{p.name}</Text>
              {owned ? <Text variant="bodyBold" tone="primary">{t.owned}</Text> : null}
            </View>
            {p.lines.map((line) => (
              <Text key={line} variant="body" tone="ink2">• {line}</Text>
            ))}

            {id === 'startKit' && widgetsSupported ? (
              <PressScale accessibilityRole="button" accessibilityHint={t.addWidgetHint}
                onPress={async () => {
                  haptics.light();
                  const ok = await addWidgetToHomeScreen();
                  toast(ok ? t.widgetAdded : t.widgetManual);
                }}
                style={[styles.btn, { backgroundColor: colors.fill }]}>
                <Text variant="bodyBold">{t.addWidget}</Text>
              </PressScale>
            ) : null}

            {id === 'startKit' && owned ? (
              <View style={styles.routines}>
                <Text variant="bodyBold">{t.routinesTitle}</Text>
                <Text variant="caption" tone="ink2">{t.routinesSub}</Text>
                <View style={styles.row}>
                  {ROUTINE_IDS.map((r) => (
                    <PressScale key={r} accessibilityRole="button" onPress={() => addRoutine(r)}
                      style={[styles.chip, { backgroundColor: colors.fill }]}>
                      <View style={styles.chipRow}>
                        <Icon name={ROUTINES[r].icon} size={16} color={colors.ink} />
                        <Text variant="bodyBold">{t.routineNames[r]}</Text>
                      </View>
                    </PressScale>
                  ))}
                </View>
              </View>
            ) : null}

            {!owned ? (
              android ? (
                <PressScale accessibilityRole="button" onPress={() => unlockPack(id)}
                  style={[styles.btn, { backgroundColor: sparks >= PACKS[id].sparks ? colors.primary : colors.fill }]}>
                  <Text variant="bodyBold" tone={sparks >= PACKS[id].sparks ? 'onPrimary' : 'ink2'}>{t.unlockSparks(PACKS[id].sparks)}</Text>
                </PressScale>
              ) : null // iOS buy button: Phase 6 (RevenueCat), with the store's real price
            ) : null}
          </View>
        );
      })}

      {TEST_BUILD && !unlocked.includes('plus') ? (
        // dev + preview builds only: lets Anass and testers try Start Kit before store purchases exist
        <PressScale accessibilityRole="button" onPress={() => { unlock('plus'); void askNotificationPermission().catch(() => false); toast('Test: all packs unlocked'); }}
          style={[styles.btn, { backgroundColor: colors.fill }]}>
          <Text variant="caption" tone="ink2">Test: unlock all packs (test builds only)</Text>
        </PressScale>
      ) : null}

      <Text variant="caption" tone="ink2" style={styles.center}>{android ? t.promiseAndroid : t.promise}</Text>
      <View style={[styles.row, styles.links]}>
        <PressScale accessibilityRole="link" hitSlop={8} onPress={() => void WebBrowser.openBrowserAsync(LINKS.terms)}>
          <Text variant="caption" tone="primary">{t.terms}</Text>
        </PressScale>
        <PressScale accessibilityRole="link" hitSlop={8} onPress={() => void WebBrowser.openBrowserAsync(LINKS.privacy)}>
          <Text variant="caption" tone="primary">{t.privacy}</Text>
        </PressScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  note: { borderRadius: radius.card, padding: space.l },
  card: { borderRadius: radius.card, padding: space.l, gap: space.s },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  packIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  routines: { gap: space.xs, marginTop: space.s },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.button, justifyContent: 'center' },
  btn: { minHeight: 50, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', marginTop: space.s },
  links: { justifyContent: 'center', gap: space.xl },
});
