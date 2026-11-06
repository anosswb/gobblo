import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Segmented } from '@/components/segmented';
import { Chips, IconTile, Row, Section } from '@/components/settings-parts';
import { Toggle } from '@/components/toggle';
import { haptics } from '@/lib/haptics';
import { play, startLoop, stopLoop } from '@/lib/sound';
import { en } from '@/i18n/en';
import { useAppStore } from '@/state/app-store';
import type { Accent, FocusSound } from '@/state/schema';
import { useTheme } from '@/theme/theme-provider';
import { accents, space } from '@/theme/tokens';

const t = en.settings;

/**
 * "Make it yours" (Anass: the sound and look options must be shown on first launch).
 * Same controls as Settings; every change previews itself (theme flips, sounds play, haptics buzz).
 */
export function FeelStep() {
  const s = useAppStore((st) => st.settings);
  const update = useAppStore((st) => st.updateSettings);
  const { scheme } = useTheme();

  useEffect(() => () => stopLoop(true), []);

  return (
    <ScrollView style={styles.fill} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Section title={t.look}>
        <Row stacked label={t.theme} right={
          <Segmented accessibilityLabel={t.theme} value={s.theme} onChange={(v) => { update({ theme: v }); haptics.select(); }}
            options={[{ value: 'system', label: t.system }, { value: 'light', label: t.light }, { value: 'dark', label: t.dark }]} />
        } />
        <Row last stacked label={t.accent} right={
          <Chips<Accent> accessibilityLabel={t.accent} value={s.accent} onChange={(v) => { update({ accent: v }); haptics.select(); play('pop'); }}
            options={(Object.keys(accents) as Accent[]).map((a) => ({ value: a, label: accents[a].label, swatch: accents[a][scheme][0] }))} />
        } />
      </Section>

      <Section title={t.soundFeel} footer={t.soundOnSilentHint}>
        <Row leading={<IconTile name="sound" color="pink" />} label={t.sounds} right={
          <Toggle accessibilityLabel={t.sounds} value={s.sound} onChange={(v) => { update({ sound: v }); if (v) setTimeout(() => play('pop'), 60); }} />
        } />
        <Row leading={<IconTile name="sound" color="orange" />} label={t.soundOnSilent} right={
          <Toggle accessibilityLabel={t.soundOnSilent} value={s.soundOnSilent} onChange={(v) => { update({ soundOnSilent: v }); if (v) setTimeout(() => play('pop'), 200); }} />
        } />
        <Row stacked label={t.volume} right={
          <Segmented accessibilityLabel={t.volume} value={s.volume >= 0.85 ? '1' : s.volume >= 0.55 ? '0.7' : '0.4'}
            onChange={(v) => { update({ volume: Number(v) }); setTimeout(() => play('pop'), 50); }}
            options={[{ value: '0.4', label: 'Soft' }, { value: '0.7', label: 'Medium' }, { value: '1', label: 'Loud' }]} />
        } />
        <Row stacked label={t.focusSound} right={
          <Chips<FocusSound> accessibilityLabel={t.focusSound} value={s.focusSound}
            onChange={(v) => { update({ focusSound: v }); startLoop(v); setTimeout(() => stopLoop(), 2500); }}
            options={[{ value: 'none', label: t.soundNone }, { value: 'brown', label: `🟤 ${t.brown}` }, { value: 'rain', label: `🌧 ${t.rain}` }, { value: 'keys', label: `⌨️ ${t.keys}` }]} />
        } />
        <Row last stacked label={t.haptics} right={
          <Segmented accessibilityLabel={t.haptics} value={s.haptics} onChange={(v) => { update({ haptics: v }); setTimeout(() => haptics.medium(), 30); }}
            options={[{ value: 'off', label: t.off }, { value: 'soft', label: t.soft }, { value: 'strong', label: t.strong }]} />
        } />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { gap: space.l, paddingBottom: space.l },
});
