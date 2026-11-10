import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Chips, Row, Section, TimeStepper } from '@/components/settings-parts';
import { Text } from '@/components/text';
import { Toggle } from '@/components/toggle';
import { toast } from '@/components/toast';
import { formatEndsAt } from '@/features/focus/timer';
import { inQuietHours } from '@/features/nudges/plan';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import type { Reminder } from '@/state/schema';
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
 * Reminders (Toolkit). Two kinds, both local notifications only:
 * - "Leave at" (time blindness): "I have to leave at 3:00 for the dentist" → the pet nudges
 *   you 20 min before so you can wrap up.
 * - "Remind me": a plain nudge at the time. Either can repeat every day.
 * The plan (features/nudges/plan.ts) makes the pet's own nudges give way on days with reminders.
 */
function reminderHint(r: Reminder, clock24h: boolean, openedAt: number): string {
  const time = formatEndsAt(r.at, clock24h);
  const when = r.repeat === 'daily' ? `Every day ${time}` : time;
  const done = r.repeat !== 'daily' && r.at < openedAt ? ' · done' : '';
  return r.leadMin > 0 ? `Leave ${when} · nudge ${r.leadMin} min before${done}` : `${when}${done}`;
}

export function RemindersScreen() {
  const { colors, reduceMotion } = useTheme();
  const reminders = useAppStore((s) => s.reminders);
  const add = useAppStore((s) => s.addReminder);
  const remove = useAppStore((s) => s.removeReminder);
  const clock24h = useAppStore((s) => s.settings.clock24h);
  const nudge = useAppStore((s) => s.settings.nudge);
  const quietStart = useAppStore((s) => s.settings.quietStart);
  const quietEnd = useAppStore((s) => s.settings.quietEnd);

  const [openedAt] = useState(() => Date.now());
  const now = new Date(openedAt);
  const [text, setText] = useState('');
  const [clock, setClock] = useState(((now.getHours() + 2) % 24) * 60);
  const [lead, setLead] = useState<'10' | '20' | '30' | '45'>('20');
  const [kind, setKind] = useState<'leave' | 'remind'>('leave');
  const [daily, setDaily] = useState(false);

  const at = nextAt(Math.floor(clock / 60), clock % 60, now);
  const leadMin = kind === 'leave' ? Number(lead) : 0;
  const nudgeHour = new Date(at - leadMin * 60_000).getHours();
  const quiet = inQuietHours(nudgeHour, quietStart, quietEnd);
  const fmt = (m: number) => formatEndsAt(nextAt(Math.floor(m / 60), m % 60, now), clock24h);
  const enter = reduceMotion ? FadeIn.duration(duration.quick) : FadeIn.duration(duration.fast);
  const exit = FadeOut.duration(duration.quick);

  return (
    <Screen back title="Reminders">
      <Text variant="subhead" tone="ink2" style={styles.intro}>Tell me when you have to leave, or what to remember. I’ll tap you on the shoulder.</Text>

      <Segmented accessibilityLabel="Kind of reminder" value={kind} onChange={(k) => { setKind(k); haptics.select(); }}
        options={[{ value: 'leave', label: 'Leave at' }, { value: 'remind', label: 'Remind me' }]} />

      <Section title="New" footer={quiet ? 'That’s in your quiet hours. I’ll still nudge you, since you asked.' : undefined}>
        <Row stacked label="What is it?" right={
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={kind === 'leave' ? 'Dentist, class, bus…' : 'Water the plants, call Mom…'}
            placeholderTextColor={colors.ink3}
            maxLength={60}
            returnKeyType="done"
            accessibilityLabel="What is it?"
            style={[styles.input, fonts.body, { color: colors.ink, backgroundColor: colors.fill }]}
          />
        } />
        <Row label={kind === 'leave' ? 'I leave at' : 'Remind me at'} hint={daily ? 'Every day' : new Date(at).getDate() === now.getDate() ? 'Today' : 'Tomorrow'} right={
          <TimeStepper label={kind === 'leave' ? 'I leave at' : 'Remind me at'} minutes={clock} onChange={setClock} format={fmt} />
        } />
        <Row last={kind === 'remind'} label="Every day" right={<Toggle accessibilityLabel="Every day" value={daily} onChange={setDaily} />} />
        {kind === 'leave' ? (
          <Row last stacked label="Nudge me before" right={
            <Chips accessibilityLabel="Nudge me before" value={lead} onChange={setLead}
              options={[{ value: '10', label: '10 min' }, { value: '20', label: '20 min' }, { value: '30', label: '30 min' }, { value: '45', label: '45 min' }]} />
          } />
        ) : null}
      </Section>

      <PressScale
        accessibilityRole="button"
        onPress={() => {
          if (!text.trim()) {
            haptics.warning();
            play('nope');
            toast(kind === 'leave' ? 'Type what it is first. “Bus” works.' : 'Type what to remember first. “Water” works.');
            return;
          }
          add({ text: text.trim(), at, leadMin, ...(daily ? { repeat: 'daily' as const } : {}) });
          haptics.success();
          play('spark');
          setText('');
          toast(nudge === 'off' ? 'Saved. (It still nudges, even with nudges off)' : 'Saved. I’ll tap you on the shoulder.');
        }}
        style={[styles.cta, { backgroundColor: colors.primary }]}>
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
                  hint={reminderHint(r, clock24h, openedAt)}
                  right={
                    <PressScale accessibilityRole="button" accessibilityLabel={`Delete ${r.text}`} hitSlop={10} onPress={() => { haptics.light(); remove(r.id); }}>
                      <Icon name="trash" size={20} color={colors.danger} />
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
  intro: { paddingHorizontal: space.xs, marginTop: -space.s },
  input: { minHeight: 44, borderRadius: radius.field, paddingHorizontal: space.m, fontSize: typeScale.body },
  cta: { minHeight: 52, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
