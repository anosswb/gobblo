import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { CaretRight } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Segmented } from '@/components/segmented';
import { Chips, Row, Section, Stepper } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { Toggle } from '@/components/toggle';
import { APP_NAME, LINKS } from '@/config/app';
import { exportBackup, importBackup } from '@/features/backup/backup';
import { haptics } from '@/lib/haptics';
import { canUseBiometrics, unlock } from '@/lib/lock';
import { play, previewNudgeSound, startLoop, stopLoop } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import type { Accent, FocusSound, NudgeSound, Settings } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';
import { accents } from '@/theme/tokens';

const t = en.settings;

const hourLabel = (h: number, h24: boolean) => (h24 ? `${String(h).padStart(2, '0')}:00` : `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`);

export function SettingsScreen() {
  const s = useAppStore((st) => st.settings);
  const update = useAppStore((st) => st.updateSettings);
  const resetAll = useAppStore((st) => st.resetAll);
  const reminders = useAppStore((st) => st.reminders);
  const { colors, scheme } = useTheme();
  const [bioOk, setBioOk] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    void canUseBiometrics().then(setBioOk);
  }, []);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  useEffect(() => () => stopLoop(true), []);

  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => update({ [k]: v } as Partial<Settings>);

  return (
    <Screen>
      <ScreenHeader title={t.title} />

      <Section title={t.look}>
        <Row stacked label={t.theme} right={
          <Segmented accessibilityLabel={t.theme} value={s.theme} onChange={set('theme')}
            options={[{ value: 'system', label: t.system }, { value: 'light', label: t.light }, { value: 'dark', label: t.dark }]} />
        } />
        <Row stacked label={t.accent} right={
          <Chips<Accent> accessibilityLabel={t.accent} value={s.accent} onChange={set('accent')}
            options={(Object.keys(accents) as Accent[]).map((a) => ({ value: a, label: accents[a].label, swatch: accents[a][scheme][0] }))} />
        } />
        <Row label={t.reduceMotion} hint={t.reduceMotionHint} right={<Toggle accessibilityLabel={t.reduceMotion} value={s.reduceMotion} onChange={set('reduceMotion')} />} />
        <Row last stacked label={t.confetti} right={
          <Segmented accessibilityLabel={t.confetti} value={s.confetti} onChange={set('confetti')}
            options={[{ value: 'lots', label: t.lots }, { value: 'little', label: t.little }, { value: 'none', label: t.none }]} />
        } />
      </Section>

      <Section title={t.soundFeel}>
        <Row label={t.sounds} right={<Toggle accessibilityLabel={t.sounds} value={s.sound} onChange={set('sound')} />} />
        <Row stacked label={t.volume} right={
          <Segmented accessibilityLabel={t.volume} value={s.volume >= 0.85 ? '1' : s.volume >= 0.55 ? '0.7' : '0.4'}
            onChange={(v) => { update({ volume: Number(v) }); setTimeout(() => play('pop'), 50); }}
            options={[{ value: '0.4', label: 'soft' }, { value: '0.7', label: 'medium' }, { value: '1', label: 'loud' }]} />
        } />
        <Row stacked label={t.haptics} right={
          <Segmented accessibilityLabel={t.haptics} value={s.haptics} onChange={(v) => { update({ haptics: v }); setTimeout(() => haptics.medium(), 30); }}
            options={[{ value: 'off', label: t.off }, { value: 'soft', label: t.soft }, { value: 'strong', label: t.strong }]} />
        } />
        <Row last label={t.mix} hint={t.mixHint} right={<Toggle accessibilityLabel={t.mix} value={s.mixWithMusic} onChange={set('mixWithMusic')} />} />
      </Section>

      <Section title={t.nudges} footer={t.nudgeFooter}>
        <Row stacked label={t.nudgeLevel} right={
          <Chips accessibilityLabel={t.nudgeLevel} value={s.nudge} onChange={set('nudge')}
            options={[{ value: 'off', label: t.off }, { value: 'gentle', label: t.gentle }, { value: 'normal', label: t.normal }, { value: 'chaos', label: t.chaos }]} />
        } />
        <Row stacked label={t.nudgeSound} hint={t.loudHint} right={
          <Chips<NudgeSound> accessibilityLabel={t.nudgeSound} value={s.nudgeSound}
            onChange={(v) => { update({ nudgeSound: v }); previewNudgeSound(v); }}
            options={[{ value: 'boop', label: '🫧 boop' }, { value: 'chime', label: '🔔 chime' }, { value: 'pop', label: '🍿 pop' }, { value: 'loud', label: '📣 loud' }]} />
        } />
        <Row label={`${t.quiet} · ${t.from}`} hint={t.quietHint} right={
          <Stepper label={t.from} value={s.quietStart} min={0} max={23} format={(h) => hourLabel(h, s.clock24h)} onChange={set('quietStart')} />
        } />
        <Row label={`${t.quiet} · ${t.to}`} right={
          <Stepper label={t.to} value={s.quietEnd} min={0} max={23} format={(h) => hourLabel(h, s.clock24h)} onChange={set('quietEnd')} />
        } />
        <Row last label={t.leaving} hint={reminders.length ? `${reminders.length} set · ${t.leavingHint}` : t.leavingHint}
          onPress={() => router.push('/reminders')} right={<CaretRight size={20} weight="bold" color={colors.ink3} />} />
      </Section>

      <Section title={t.focus}>
        <Row stacked label={t.defaultTimer} right={
          <Segmented accessibilityLabel={t.defaultTimer} value={String(s.defaultTimer) as '2' | '5' | '15' | '25'}
            onChange={(v) => update({ defaultTimer: Number(v) as Settings['defaultTimer'] })}
            options={[{ value: '2', label: '2 min' }, { value: '5', label: '5' }, { value: '15', label: '15' }, { value: '25', label: '25' }]} />
        } />
        <Row stacked label={t.focusSound} right={
          <Chips<FocusSound> accessibilityLabel={t.focusSound} value={s.focusSound}
            onChange={(v) => { update({ focusSound: v }); startLoop(v); setTimeout(() => stopLoop(), 2500); }}
            options={[{ value: 'none', label: t.soundNone }, { value: 'brown', label: `🟤 ${t.brown}` }, { value: 'rain', label: `🌧 ${t.rain}` }, { value: 'keys', label: `⌨️ ${t.keys}` }]} />
        } />
        <Row last label={t.oneThing} hint={t.oneThingHint} right={<Toggle accessibilityLabel={t.oneThing} value={s.oneThingMode} onChange={set('oneThingMode')} />} />
      </Section>

      <Section title={t.petYou}>
        <Row stacked label={t.petTalk} right={
          <Segmented accessibilityLabel={t.petTalk} value={s.petTalk} onChange={set('petTalk')}
            options={[{ value: 'chatty', label: t.chatty }, { value: 'quiet', label: t.quietTalk }, { value: 'silent', label: t.silent }]} />
        } />
        <Row label={t.autoSleep} right={<Toggle accessibilityLabel={t.autoSleep} value={s.autoSleep} onChange={set('autoSleep')} />} />
        <Row label={t.mindful} hint={t.mindfulHint} right={<Toggle accessibilityLabel={t.mindful} value={s.mindfulNote} onChange={set('mindfulNote')} />} />
        <Row last label={t.jar} hint={t.jarHint} right={<Toggle accessibilityLabel={t.jar} value={s.goodThingsJar} onChange={set('goodThingsJar')} />} />
      </Section>

      <Section title={t.time}>
        <Row stacked label={t.weekStart} right={
          <Segmented accessibilityLabel={t.weekStart} value={s.weekStartsMonday ? 'mon' : 'sun'} onChange={(v) => update({ weekStartsMonday: v === 'mon' })}
            options={[{ value: 'mon', label: t.monday }, { value: 'sun', label: t.sunday }]} />
        } />
        <Row last label={t.clock24} right={<Toggle accessibilityLabel={t.clock24} value={s.clock24h} onChange={set('clock24h')} />} />
      </Section>

      <Section title={t.privacy} footer={t.dataLocal}>
        <Row label={t.lock} hint={bioOk ? t.lockHint : t.lockUnavailable} right={
          <Toggle accessibilityLabel={t.lock} disabled={!bioOk} value={s.biometricLock}
            onChange={async (v) => { if (await unlock()) update({ biometricLock: v }); }} />
        } />
        <Row label={t.exportBackup} hint={t.exportHint} onPress={() => void exportBackup().catch(() => toast('couldn’t export. try again?'))}
          right={<CaretRight size={20} weight="bold" color={colors.ink3} />} />
        <Row label={t.importBackup} hint={t.importHint} onPress={async () => { const r = await importBackup(); if (r.message) toast(r.message); }}
          right={<CaretRight size={20} weight="bold" color={colors.ink3} />} />
        <Row last danger label={armed ? t.resetConfirm : t.reset} hint={t.resetHint}
          onPress={() => {
            if (!armed) { haptics.warning(); setArmed(true); return; }
            resetAll();
            setArmed(false);
            toast('fresh start. hi again ✦');
          }} />
      </Section>

      <Section title={t.about}>
        <Row label={t.version} right={<Text tone="ink2">{Constants.expoConfig?.version ?? '–'}</Text>} />
        <Row label={`${APP_NAME} ${t.notMedical}`} />
        <Row label={t.privacyPolicy} onPress={() => void WebBrowser.openBrowserAsync(LINKS.privacy)} right={<CaretRight size={20} weight="bold" color={colors.ink3} />} />
        <Row label={t.terms} onPress={() => void WebBrowser.openBrowserAsync(LINKS.terms)} right={<CaretRight size={20} weight="bold" color={colors.ink3} />} />
        <Row last label={t.contact} onPress={() => void Linking.openURL(`mailto:${LINKS.supportEmail}`)} right={<CaretRight size={20} weight="bold" color={colors.ink3} />} />
      </Section>
    </Screen>
  );
}
