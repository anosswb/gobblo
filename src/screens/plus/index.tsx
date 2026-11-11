import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { LINKS } from '@/config/app';
import { MONETIZATION } from '@/config/monetization';
import { anythingToBuy } from '@/features/closet/shop';
import { useLook } from '@/features/closet/use-look';
import { askNotificationPermission } from '@/features/nudges/schedule';
import { canShowOffer, DISPLAY_PRICE, hasPlus, PLUS_SPARKS } from '@/features/plus/catalog';
import { ROUTINE_IDS, ROUTINES, type RoutineId } from '@/features/plus/routines';
import { videoOffersOn } from '@/features/plus/use-video-treat';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { buyPlus, getPlusPrice, restorePlus } from '@/lib/purchases';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';
import { addWidgetToHomeScreen, widgetsSupported } from '@/widgets/update';

import { VideoTreat } from './video-treat';

const t = en.plus;
/** dev app + the GitHub preview APK (testers): a button to unlock Plus. Never in store builds. */
const TEST_BUILD = __DEV__ || Constants.expoConfig?.extra?.variant === 'preview';

/**
 * Plus (docs/13): one page, one button. Opened only by the user (Settings, Closet): never a
 * pop-up, never in onboarding, never in the core loop (CLAUDE.md). Android: costs sparks. iOS:
 * one-time App Store purchase through src/lib/purchases.ts (the store's price replaces the
 * display default once known).
 */
export function PlusScreen() {
  const { colors } = useTheme();
  const unlocked = useAppStore((s) => s.unlocked);
  const sparks = useAppStore((s) => s.stats.sparks);
  const firstOpen = useAppStore((s) => s.settings.firstOpen);
  const adOffers = useAppStore((s) => s.settings.adOffers);
  const buyWithSparks = useAppStore((s) => s.buyPlusWithSparks);
  const addBites = useAppStore((s) => s.addBites);
  const toggleDaily = useAppStore((s) => s.toggleDaily);
  const unlock = useAppStore((s) => s.unlock);
  const android = MONETIZATION === 'ads';
  const owned = hasPlus(unlocked);
  const look = useLook();
  // Plus itself is sold for sparks on Android, so it counts as something to buy until owned
  const sparksBuySomething = anythingToBuy(look, android);
  const [price, setPrice] = useState(DISPLAY_PRICE);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (android) return;
    let live = true;
    void getPlusPrice().then((p) => { if (live && p) setPrice(p); }).catch(() => undefined);
    return () => { live = false; };
  }, [android]);

  const onUnlocked = () => {
    // the lock-screen timer is a notification: ask once, right when it becomes useful
    void askNotificationPermission().catch(() => false);
    haptics.success();
    play('spark');
    toast(t.unlocked);
  };

  const unlockWithSparks = () => {
    if (buyWithSparks()) {
      onUnlocked();
    } else {
      haptics.warning();
      play('nope');
      toast(t.needSparks(sparks, PLUS_SPARKS));
    }
  };

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await buyPlus();
      if (r === 'bought') {
        unlock('plus');
        onUnlocked();
      } else if (r === 'unavailable') {
        toast(t.buyUnavailable);
      }
    } catch {
      toast(t.buyUnavailable);
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (await restorePlus()) {
        unlock('plus');
        haptics.success();
        toast(t.restored);
      } else {
        toast(t.restoreNone);
      }
    } catch {
      toast(t.restoreNone);
    } finally {
      setBusy(false);
    }
  };

  const addRoutine = (id: RoutineId) => {
    const ids = addBites(ROUTINES[id].bites, 'routine');
    ids.forEach(toggleDaily);
    haptics.success();
    play('pop');
    toast(t.routineAdded(t.routineNames[id], ids.length));
  };

  const canSpend = sparks >= PLUS_SPARKS;

  return (
    <Screen back title={t.title}>
      <Text variant="body" tone="ink2">{android ? t.introAndroid : t.intro}</Text>
      {!canShowOffer(firstOpen) ? (
        <View style={[styles.note, { backgroundColor: colors.fill }]}>
          <Text variant="subhead">{t.weekOne}</Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.head}>
          <View style={[styles.packIcon, { backgroundColor: colors.primarySoft }]}>
            <Icon name="sparkle" size={20} color={colors.primaryInk} />
          </View>
          <Text variant="heading" style={styles.flex}>{t.title}</Text>
          {owned ? <Text variant="bodyBold" tone="primary">{t.owned}</Text> : null}
        </View>
        {t.lines.map((line) => (
          <Text key={line} variant="body" tone="ink2">• {line}</Text>
        ))}

        {!owned ? (
          android ? (
            <>
              <PressScale accessibilityRole="button" onPress={unlockWithSparks}
                style={[styles.btn, { backgroundColor: canSpend ? colors.primary : colors.fill }]}>
                <Text variant="bodyBold" tone={canSpend ? 'onPrimary' : 'ink2'}>{t.unlockSparks(PLUS_SPARKS)}</Text>
              </PressScale>
              <Text variant="caption" tone="ink2" style={styles.center}>{t.haveSparks(sparks, PLUS_SPARKS)}</Text>
            </>
          ) : (
            <PressScale accessibilityRole="button" disabled={busy} onPress={() => void buy()}
              style={[styles.btn, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}>
              <Text variant="bodyBold" tone="onPrimary">{t.unlockIos(price)}</Text>
            </PressScale>
          )
        ) : null}
      </View>

      {/* the optional video (Android): also after Plus, while sparks still buy Closet items;
          hidden once there is nothing left to buy (never offer sparks that buy nothing) */}
      {videoOffersOn(adOffers, sparksBuySomething) ? <VideoTreat /> : null}

      {widgetsSupported ? (
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

      <View style={styles.routines}>
        <Text variant="bodyBold">{t.routinesTitle}</Text>
        <Text variant="caption" tone="ink2">{owned ? t.routinesSub : t.routinesLocked}</Text>
        {owned ? (
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
        ) : null}
      </View>

      {TEST_BUILD && !owned ? (
        // dev + preview builds only: lets Anass and testers try Plus before store purchases exist
        <PressScale accessibilityRole="button" onPress={() => { unlock('plus'); onUnlocked(); }}
          style={[styles.btn, { backgroundColor: colors.fill }]}>
          <Text variant="caption" tone="ink2">Test: unlock Plus (test builds only)</Text>
        </PressScale>
      ) : null}

      <Text variant="caption" tone="ink2" style={styles.center}>{android ? t.promiseAndroid : t.promise}</Text>
      <View style={[styles.row, styles.links]}>
        {!android ? (
          <PressScale accessibilityRole="button" hitSlop={8} style={styles.linkTap} disabled={busy} onPress={() => void restore()}>
            <Text variant="caption" tone="primary">{t.restore}</Text>
          </PressScale>
        ) : null}
        <PressScale accessibilityRole="link" hitSlop={8} style={styles.linkTap} onPress={() => void WebBrowser.openBrowserAsync(LINKS.terms)}>
          <Text variant="caption" tone="primary">{t.terms}</Text>
        </PressScale>
        <PressScale accessibilityRole="link" hitSlop={8} style={styles.linkTap} onPress={() => void WebBrowser.openBrowserAsync(LINKS.privacy)}>
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
  links: { justifyContent: 'center', gap: space.m },
  linkTap: { minHeight: 44, paddingHorizontal: space.s, justifyContent: 'center' },
});
