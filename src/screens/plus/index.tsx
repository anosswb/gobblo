import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { LINKS } from '@/config/app';
import { MONETIZATION } from '@/config/monetization';
import { askNotificationPermission } from '@/features/nudges/schedule';
import { canShowOffer, DISPLAY_PRICE, hasPack, PACK_IDS, PACKS, type PackId } from '@/features/plus/catalog';
import { ROUTINE_IDS, ROUTINES, type RoutineId } from '@/features/plus/routines';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { addWidgetToHomeScreen, widgetsSupported } from '@/widgets/update';
import { radius, space } from '@/theme/tokens';

const t = en.plus;

/**
 * Gobblo Plus (docs/13). Opened only by the user (Settings, Closet): never a pop-up, never in
 * onboarding, never in the core loop (CLAUDE.md). Android: packs cost sparks. iOS: App Store
 * purchases arrive in Phase 6 (RevenueCat), so prices show as "coming soon" until then.
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
    <Screen back eyebrow={t.eyebrow} title={t.title}>
      <Text variant="body" tone="ink2">{t.intro}</Text>
      {!canShowOffer(firstOpen) ? (
        <View style={[styles.note, { backgroundColor: colors.primarySoft }]}>
          <Text variant="subhead">{t.weekOne}</Text>
        </View>
      ) : null}

      {PACK_IDS.map((id) => {
        const owned = hasPack(unlocked, id);
        const p = t.packs[id];
        return (
          <View key={id} style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.head}>
              <Text style={styles.emoji}>{PACKS[id].emoji}</Text>
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
                <Text variant="bodyBold">📱 {t.addWidget}</Text>
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
                      <Text variant="bodyBold">{ROUTINES[r].emoji} {t.routineNames[r]}</Text>
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
              ) : (
                <View style={[styles.btn, { backgroundColor: colors.fill }]}>
                  <Text variant="bodyBold" tone="ink2">{t.priceSoon(DISPLAY_PRICE.pack)}</Text>
                </View>
              )
            ) : null}
          </View>
        );
      })}

      {!android ? (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text variant="heading">✦ {t.bundle(DISPLAY_PRICE.plus)}</Text>
          <Text variant="caption" tone="ink2">{t.soonNote}</Text>
        </View>
      ) : null}

      {__DEV__ && !unlocked.includes('plus') ? (
        // dev builds only (stripped from release): lets Anass test Start Kit before store purchases exist
        <PressScale accessibilityRole="button" onPress={() => { unlock('plus'); void askNotificationPermission().catch(() => false); toast('Dev: all packs unlocked'); }}
          style={[styles.btn, { backgroundColor: colors.fill }]}>
          <Text variant="caption" tone="ink2">Test: unlock all packs (dev app only)</Text>
        </PressScale>
      ) : null}

      <Text variant="caption" tone="ink2" style={styles.center}>{t.promise}</Text>
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
  emoji: { fontSize: 28, lineHeight: 34 },
  routines: { gap: space.xs, marginTop: space.s },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.button, justifyContent: 'center' },
  btn: { minHeight: 50, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', marginTop: space.s },
  links: { justifyContent: 'center', gap: space.xl },
});
