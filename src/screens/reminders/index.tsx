import { Trash } from 'phosphor-react-native';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Chips, Row, Section, Stepper } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { toast } from '@/components/toast';
import { formatEndsAt } from '@/features/focus/timer';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { fonts, radius, space, typeScale } from '@/theme/tokens';

/** Next time this clock time happens (today if still ahead, else tomorrow). */
export function nextAt(hour: number, minute: number, now = new Date()): number {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/**
 * "Leaving soon" (ADHD time blindness): "i have to leave at 3:00 for the dentist" →
 * the pet nudges you 20 min before so you can wrap up. Uses local notifications only.
 */
export function RemindersScreen() {
  const { colors, reduceMotion } = useTheme();
  const reminders = useAppStore((s) => s.reminders);
  const add = useAppStore((s) => s.addReminder);
  const remove = useAppStore((s) => s.removeReminder);
  const clock24h = useAppStore((s) => s.settings.clock24h);
  const nudge = useAppStore((s) => s.settings.nudge);

  const [openedAt] = useState(() => Date.now());
  const now = new Date(openedAt);
  const [text, setText] = useState('');
  const [hour, setHour] = useState((now.getHours() + 2) % 24);
  const [minute, setMinute] = useState(0);
  const [lead, setLead] = useState<'10' | '20' | '30' | '45'>('20');

  const at = nextAt(hour, minute, now);
  const enter = reduceMotion ? FadeIn.duration(duration.quick) : FadeIn.duration(duration.fast);
  const exit = FadeOut.duration(duration.quick);

  return (
    <Screen>
      <ScreenHeader title="Leaving soon" />
      <Text tone="ink2">Tell me when you have to leave. I’ll nudge you before, so you can wrap up the tiny thing.</Text>

      <Section title="New">
        <Row stacked label="What is it?" right={
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Dentist, class, bus…"
            placeholderTextColor={colors.ink3}
            maxLength={60}
            returnKeyType="done"
            accessibilityLabel="What is it?"
            style={[styles.input, { color: colors.ink, backgroundColor: colors.cardAlt, fontFamily: fonts.bodyBold }]}
          />
        } />
        <Row label="I leave at" hint={formatEndsAt(at, clock24h)} right={
          <View style={styles.time}>
            <Stepper label="Hour" value={hour} min={0} max={23} format={(h) => String(h).padStart(2, '0')} onChange={setHour} />
            <Stepper label="Minutes" value={minute / 5} min={0} max={11} format={(m) => String(m * 5).padStart(2, '0')} onChange={(m) => setMinute(m * 5)} />
          </View>
        } />
        <Row last stacked label="Nudge me before" right={
          <Chips accessibilityLabel="Nudge me before" value={lead} onChange={setLead}
            options={[{ value: '10', label: '10 min' }, { value: '20', label: '20 min' }, { value: '30', label: '30 min' }, { value: '45', label: '45 min' }]} />
        } />
      </Section>

      <PressScale
        accessibilityRole="button"
        onPress={() => {
          if (!text.trim()) {
            haptics.warning();
            play('nope');
            toast('Type what it is first. “Bus” works.');
            return;
          }
          add({ text: text.trim(), at, leadMin: Number(lead) });
          haptics.success();
          play('spark');
          setText('');
          toast(nudge === 'off' ? 'Saved. (It still nudges, even with nudges off)' : 'Saved. I’ll tap you on the shoulder ✦');
        }}
        style={[styles.cta, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDeep }]}>
        <Text variant="bodyBold" tone="onPrimary">Add reminder</Text>
      </PressScale>

      {reminders.length > 0 && (
        <Section title="Coming up">
          {reminders
            .slice()
            .sort((a, b) => a.at - b.at)
            .map((r, i, list) => (
              <Animated.View key={r.id} entering={enter} exiting={exit} layout={reduceMotion ? undefined : LinearTransition}>
                <Row
                  last={i === list.length - 1}
                  label={r.text}
                  hint={`Leave ${formatEndsAt(r.at, clock24h)} · Nudge ${r.leadMin} min before${r.at < openedAt ? ' · done' : ''}`}
                  right={
                    <PressScale accessibilityRole="button" accessibilityLabel={`Delete ${r.text}`} hitSlop={10} onPress={() => { haptics.light(); remove(r.id); }}>
                      <Trash size={22} weight="bold" color={colors.ink3} />
                    </PressScale>
                  }
                />
              </Animated.View>
            ))}
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48, borderRadius: radius.button - 4, paddingHorizontal: space.l, fontSize: typeScale.m },
  time: { gap: space.s, alignItems: 'flex-end' },
  cta: { minHeight: 56, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5 },
});
