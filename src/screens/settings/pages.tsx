import { ADS } from '@/config/ads';
import { privacyOptionsRequired, showPrivacyOptions } from '@/lib/ads';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Chips, IconTile, Row, Section, Stepper } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { Toggle } from '@/components/toggle';
import { APP_NAME, LINKS } from '@/config/app';
import { exportBackup, importBackup } from '@/features/backup/backup';
import { COLORS, isUnlocked } from '@/features/closet/items';
import { useLook } from '@/features/closet/use-look';
import { haptics } from '@/lib/haptics';
import { canUseBiometrics, unlock } from '@/lib/lock';
import { play, previewNudgeSound, startLoop, stopLoop } from '@/lib/sound';
import { en } from '@/i18n/en';
import { FAQ } from '@/i18n/faq.en';
import { GUIDES, GUIDE_NAMES, guideCopy, type GuideId } from '@/i18n/guides.en';
import { PageGuide } from '@/components/guide/page-guide';
import { duration } from '@/theme/motion';
import { useAppStore } from '@/state/app-store';
import type { FocusSound, NudgeSound, NudgeTime, Settings } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';
import { fonts, petColors, radius, space, typeScale, type PetColor, type TileColor } from '@/theme/tokens';

const t = en.settings;

export type PageId = keyof typeof t.pages;
export const PAGE_IDS = Object.keys(t.pages) as PageId[];
export const isPageId = (v: unknown): v is PageId => typeof v === 'string' && (PAGE_IDS as string[]).includes(v);

/** The icon tile each page shows on the main Settings list (iOS Settings colours). */
export const PAGE_TILE: Record<PageId, { icon: IconName; color: TileColor }> = {
  look: { icon: 'palette', color: 'blue' },
  sound: { icon: 'sound', color: 'pink' },
  nudges: { icon: 'bell', color: 'red' },
  focus: { icon: 'timer', color: 'indigo' },
  pet: { icon: 'heart', color: 'pink' },
  time: { icon: 'clock', color: 'gray' },
  privacy: { icon: 'lock', color: 'green' },
  about: { icon: 'info', color: 'gray' },
  faq: { icon: 'help', color: 'blue' },
};

const hourLabel = (h: number, h24: boolean) => (h24 ? `${String(h).padStart(2, '0')}:00` : `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`);

const RETIRED_GUIDES: string[] = ['tip', 'breathe', 'sit'];

/** One Settings page (the main list pushes here). Same controls as before, one topic per page. */
export function SettingsPage({ id }: { id: PageId }) {
  return (
    <Screen back title={t.pages[id]}>
      {id === 'look' ? <Look /> : null}
      {id === 'sound' ? <Sound /> : null}
      {id === 'nudges' ? <Nudges /> : null}
      {id === 'focus' ? <Focus /> : null}
      {id === 'pet' ? <PetPage /> : null}
      {id === 'time' ? <Time /> : null}
      {id === 'privacy' ? <Privacy /> : null}
      {id === 'about' ? <About /> : null}
      {id === 'faq' ? <Faq /> : null}
    </Screen>
  );
}

function useSettings() {
  const s = useAppStore((st) => st.settings);
  const update = useAppStore((st) => st.updateSettings);
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => update({ [k]: v } as Partial<Settings>);
  return { s, update, set };
}

function Look() {
  const { s, set } = useSettings();
  return (
    <>
      <Section title={t.theme}>
        <Row last stacked hideLabel label={t.theme} right={
          <Segmented accessibilityLabel={t.theme} value={s.theme} onChange={set('theme')}
            options={[{ value: 'system', label: t.system }, { value: 'light', label: t.light }, { value: 'dark', label: t.dark }]} />
        } />
      </Section>
      <Section>
        <Row leading={<IconTile name="motion" color="indigo" />} last label={t.reduceMotion} hint={t.reduceMotionHint} right={<Toggle accessibilityLabel={t.reduceMotion} value={s.reduceMotion} onChange={set('reduceMotion')} />} />
      </Section>
    </>
  );
}

function Sound() {
  const { s, update, set } = useSettings();
  return (
    <>
      <Section>
        <Row leading={<IconTile name="sound" color="pink" />} label={t.sounds} right={<Toggle accessibilityLabel={t.sounds} value={s.sound} onChange={set('sound')} />} />
        <Row leading={<IconTile name="sound" color="orange" />} label={t.soundOnSilent} hint={t.soundOnSilentHint} last right={
          <Toggle accessibilityLabel={t.soundOnSilent} value={s.soundOnSilent} onChange={(v) => { update({ soundOnSilent: v }); if (v) setTimeout(() => play('pop'), 150); }} />
        } />
      </Section>
      <Section title={t.haptics}>
        <Row last stacked hideLabel label={t.haptics} right={
          <Segmented accessibilityLabel={t.haptics} value={s.haptics} onChange={(v) => { update({ haptics: v }); setTimeout(() => haptics.medium(), 30); }}
            options={[{ value: 'off', label: t.off }, { value: 'soft', label: t.soft }, { value: 'strong', label: t.strong }]} />
        } />
      </Section>
    </>
  );
}

function Nudges() {
  const { s, update, set } = useSettings();
  const reminders = useAppStore((st) => st.reminders);
  return (
    <>
      <Section title={t.nudgeLevel} footer={t.nudgeFooter}>
        <Row last stacked hideLabel label={t.nudgeLevel} right={
          <Chips accessibilityLabel={t.nudgeLevel} value={s.nudge} onChange={set('nudge')}
            options={[{ value: 'off', label: t.off }, { value: 'gentle', label: t.gentle }, { value: 'normal', label: t.normal }, ...(s.nudge === 'chaos' ? [{ value: 'chaos' as const, label: t.chaos }] : [])]} />
        } />
      </Section>
      <Section title={t.nudgeTime} footer={t.nudgeTimeHint}>
        <Row last stacked hideLabel label={t.nudgeTime} right={
          <Chips<NudgeTime> accessibilityLabel={t.nudgeTime} value={s.nudgeTime} onChange={set('nudgeTime')}
            options={[{ value: 'morning', label: t.morning }, { value: 'afternoon', label: t.afternoon }, { value: 'evening', label: t.evening }]} />
        } />
      </Section>
      <Section title={t.nudgeSound} footer={t.loudHint}>
        <Row last stacked hideLabel label={t.nudgeSound} right={
          <Chips<NudgeSound> accessibilityLabel={t.nudgeSound} value={s.nudgeSound}
            onChange={(v) => { update({ nudgeSound: v }); previewNudgeSound(v); }}
            options={[{ value: 'boop', label: 'Boop' }, { value: 'chime', label: 'Chime' }, { value: 'pop', label: 'Pop' }, { value: 'loud', label: 'Loud' }]} />
        } />
      </Section>
      <Section title={t.quiet} footer={t.quietHint}>
        <Row leading={<IconTile name="moon" color="indigo" />} label={t.from} right={
          <Stepper label={t.from} value={s.quietStart} min={0} max={23} format={(h) => hourLabel(h, s.clock24h)} onChange={set('quietStart')} />
        } />
        <Row leading={<IconTile name="sun" color="orange" />} last label={t.to} right={
          <Stepper label={t.to} value={s.quietEnd} min={0} max={23} format={(h) => hourLabel(h, s.clock24h)} onChange={set('quietEnd')} />
        } />
      </Section>
      <Section footer={t.leavingHint}>
        <Row leading={<IconTile name="walk" color="orange" />} last label={t.leaving}
          right={reminders.length ? <Text tone="ink2">{reminders.length}</Text> : undefined}
          onPress={() => router.push('/reminders')} />
      </Section>
    </>
  );
}

function Focus() {
  const { s, update, set } = useSettings();
  useEffect(() => () => stopLoop(true), []);
  return (
    <>
      <Section title={t.defaultTimer}>
        <Row last stacked hideLabel label={t.defaultTimer} right={
          <Segmented accessibilityLabel={t.defaultTimer} value={String(s.defaultTimer) as '2' | '5' | '15' | '25'}
            onChange={(v) => update({ defaultTimer: Number(v) as Settings['defaultTimer'] })}
            options={[{ value: '2', label: '2 min' }, { value: '5', label: '5' }, { value: '15', label: '15' }, { value: '25', label: '25' }]} />
        } />
      </Section>
      <Section title={t.focusSound}>
        <Row last stacked hideLabel label={t.focusSound} right={
          <Chips<FocusSound> accessibilityLabel={t.focusSound} value={s.focusSound}
            onChange={(v) => { update({ focusSound: v }); startLoop(v); setTimeout(() => stopLoop(), 2500); }}
            options={[{ value: 'none', label: t.soundNone }, { value: 'brown', label: t.brown }, { value: 'rain', label: t.rain }, { value: 'keys', label: t.keys }]} />
        } />
      </Section>
      <Section footer={t.oneThingHint}>
        <Row leading={<IconTile name="target" color="red" />} last label={t.oneThing} right={<Toggle accessibilityLabel={t.oneThing} value={s.oneThingMode} onChange={set('oneThingMode')} />} />
      </Section>
      <Section footer={t.keepAwakeHint}>
        <Row leading={<IconTile name="sun" color="orange" />} last label={t.keepAwake} right={<Toggle accessibilityLabel={t.keepAwake} value={s.focusKeepAwake} onChange={set('focusKeepAwake')} />} />
      </Section>
    </>
  );
}

/** FAQ: tap a question to open its answer (one open at a time keeps it short). */
function Faq() {
  const { colors, reduceMotion } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  const [guide, setGuide] = useState<GuideId | null>(null);
  // guides for pages that were merged away (docs/15) are not listed
  const ids = (Object.keys(GUIDES) as GuideId[]).filter((g) => !RETIRED_GUIDES.includes(g));
  return (
    <>
    <Section title={guideCopy.howSection}>
      {ids.map((gid, i) => (
        <Row key={gid} label={GUIDE_NAMES[gid]} last={i === ids.length - 1} onPress={() => { haptics.select(); setGuide(gid); }} />
      ))}
    </Section>
    {guide ? <PageGuide id={guide} visible onClose={() => setGuide(null)} /> : null}
    <Text variant="caption" tone="ink2" style={styles.faqHead} accessibilityRole="header">{guideCopy.faqSection}</Text>
    <View style={[styles.faq, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {FAQ.map((item, i) => {
        const on = open === i;
        return (
          <View key={item.q} style={i > 0 ? [styles.faqSep, { borderTopColor: colors.line }] : undefined}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: on }}
              onPress={() => { haptics.select(); setOpen(on ? null : i); }}
              style={styles.faqQ}>
              <Text variant="bodyBold" style={styles.flex}>{item.q}</Text>
              <Icon name={on ? 'chevronUp' : 'chevronDown'} size={13} weight="bold" color={colors.ink3} />
            </Pressable>
            {on ? (
              <Animated.View entering={FadeIn.duration(reduceMotion ? duration.quick : duration.fast)}>
                <Text variant="body" tone="ink2" style={styles.faqA}>{item.a}</Text>
              </Animated.View>
            ) : null}
          </View>
        );
      })}
    </View>
    </>
  );
}

function PetPage() {
  const { s, update, set } = useSettings();
  const { colors } = useTheme();
  const pet = useAppStore((st) => st.pet);
  const look = useLook();
  const patchPet = useAppStore((st) => st.patchPet);
  const [nameDraft, setNameDraft] = useState(pet.name);
  return (
    <>
      <Section>
        <Row label={t.petName} leading={<IconTile name="heart" color="pink" />} last right={
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onEndEditing={() => patchPet({ name: nameDraft.trim() || pet.name })}
            onSubmitEditing={() => patchPet({ name: nameDraft.trim() || pet.name })}
            maxLength={16}
            autoCapitalize="words"
            returnKeyType="done"
            accessibilityLabel={t.petName}
            style={[styles.nameInput, fonts.body, { color: colors.ink2 }]}
          />
        } />
      </Section>
      <Section title={t.petColor}>
        <Row last stacked hideLabel label={t.petColor} right={
          <Chips<PetColor> accessibilityLabel={t.petColor} value={look.color} onChange={(c) => patchPet({ color: c })}
            options={COLORS.filter((c) => isUnlocked(c.unlock, look.level, look.plus, look.week)).map((c) => ({ value: c.id, label: c.name, swatch: petColors[c.id] }))} />
        } />
      </Section>
      <Section>
        <Row leading={<IconTile name="sparkle" color="purple" />} label={t.petTalk} right={
          <Toggle accessibilityLabel={t.petTalk} value={s.petTalk !== 'silent'} onChange={(v) => update({ petTalk: v ? 'chatty' : 'silent' })} />
        } />
        <Row leading={<IconTile name="bed" color="teal" />} label={t.autoSleep} right={<Toggle accessibilityLabel={t.autoSleep} value={s.autoSleep} onChange={set('autoSleep')} />} />
        <Row leading={<IconTile name="heart" color="pink" />} last label={t.jar} hint={t.jarHint} right={<Toggle accessibilityLabel={t.jar} value={s.goodThingsJar} onChange={set('goodThingsJar')} />} />
      </Section>
    </>
  );
}

function Time() {
  const { s, update, set } = useSettings();
  return (
    <>
      <Section title={t.weekStart}>
        <Row last stacked hideLabel label={t.weekStart} right={
          <Segmented accessibilityLabel={t.weekStart} value={s.weekStartsMonday ? 'mon' : 'sun'} onChange={(v) => update({ weekStartsMonday: v === 'mon' })}
            options={[{ value: 'mon', label: t.monday }, { value: 'sun', label: t.sunday }]} />
        } />
      </Section>
      <Section>
        <Row leading={<IconTile name="clock" color="gray" />} last label={t.clock24} right={<Toggle accessibilityLabel={t.clock24} value={s.clock24h} onChange={set('clock24h')} />} />
      </Section>
    </>
  );
}

function Privacy() {
  const { s, update } = useSettings();
  const resetAll = useAppStore((st) => st.resetAll);
  const [bioOk, setBioOk] = useState(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    void canUseBiometrics().then(setBioOk);
  }, []);
  // Android only: the video offer switch, and Google's consent form where the law asks for it
  const android = Platform.OS === 'android' && ADS.enabled;
  const [adPrivacy, setAdPrivacy] = useState(false);
  useEffect(() => {
    if (android) void privacyOptionsRequired().then(setAdPrivacy);
  }, [android]);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <>
      <Section footer={bioOk ? t.lockHint : t.lockUnavailable}>
        <Row leading={<IconTile name="lock" color="green" />} last label={t.lock} right={
          <Toggle accessibilityLabel={t.lock} disabled={!bioOk} value={s.biometricLock}
            onChange={async (v) => { if (await unlock()) update({ biometricLock: v }); }} />
        } />
      </Section>
      {android ? (
        <Section footer={t.adOffersHint}>
          <Row leading={<IconTile name="play" color="orange" />} last={!adPrivacy} label={t.adOffers} right={
            <Toggle accessibilityLabel={t.adOffers} value={s.adOffers !== false} onChange={(v) => update({ adOffers: v })} />
          } />
          {adPrivacy ? <Row leading={<IconTile name="lock" color="gray" />} last label={t.privacyOptions} onPress={() => void showPrivacyOptions()} /> : null}
        </Section>
      ) : null}
      <Section title={t.backup} footer={t.dataLocal}>
        <Row leading={<IconTile name="share" color="blue" />} label={t.exportBackup} hint={t.exportHint} onPress={() => void exportBackup().catch(() => toast('Couldn’t export. Try again?'))} />
        <Row leading={<IconTile name="download" color="blue" />} last label={t.importBackup} hint={t.importHint} onPress={async () => { const r = await importBackup(); if (r.message) toast(r.message); }} />
      </Section>
      <Section footer={t.resetHint}>
        <Row leading={<IconTile name="reset" color="red" />} last danger label={armed ? t.resetConfirm : t.reset}
          onPress={() => {
            if (!armed) { haptics.warning(); setArmed(true); return; }
            resetAll();
            setArmed(false);
            toast('Fresh start. Hi again.');
          }} />
      </Section>
    </>
  );
}

function About() {
  return (
    <>
      <Section>
        <Row leading={<IconTile name="info" color="gray" />} label={t.version} right={<Text tone="ink2">{Constants.expoConfig?.version ?? '–'}</Text>} />
        <Row leading={<IconTile name="heart" color="gray" />} label={`${APP_NAME} ${t.notMedical}`} />
        <Row leading={<IconTile name="sound" color="gray" />} last label={t.soundCredits} />
      </Section>
      <Section>
        <Row leading={<IconTile name="doc" color="gray" />} label={t.privacyPolicy} onPress={() => void WebBrowser.openBrowserAsync(LINKS.privacy)} />
        <Row leading={<IconTile name="doc" color="gray" />} label={t.terms} onPress={() => void WebBrowser.openBrowserAsync(LINKS.terms)} />
        <Row leading={<IconTile name="mail" color="blue" />} last label={t.contact} onPress={() => void Linking.openURL(`mailto:${LINKS.supportEmail}`)} />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  faq: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  faqHead: { paddingHorizontal: space.l, marginBottom: space.s },
  faqSep: { borderTopWidth: StyleSheet.hairlineWidth },
  faqQ: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52, paddingHorizontal: space.l, paddingVertical: space.m },
  faqA: { paddingHorizontal: space.l, paddingBottom: space.l },
  nameInput: { minWidth: 110, maxWidth: 170, minHeight: 36, textAlign: 'right', fontSize: typeScale.body },
});
