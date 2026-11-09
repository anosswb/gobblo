import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import { APP_NAME } from '@/config/app';
import type { NudgeSound, PersistedState } from '@/state/schema';

import { biteTimes } from '@/features/bites/when';

import { planNudges } from './plan';

/** One Android channel per sound (a channel's sound can't change after creation). */
const SOUND_FILE: Record<NudgeSound, string> = {
  boop: 'boop.wav',
  chime: 'chime.wav',
  pop: 'pop.wav',
  loud: 'loud.wav',
};
const channelId = (s: NudgeSound) => `nudges-${s}`;

let channelsReady = false;
async function ensureChannels() {
  if (Platform.OS !== 'android' || channelsReady) return;
  for (const s of Object.keys(SOUND_FILE) as NudgeSound[]) {
    await Notifications.setNotificationChannelAsync(channelId(s), {
      name: s === 'loud' ? 'Nudges (loud)' : `Nudges (${s})`,
      importance: s === 'loud' ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
      sound: SOUND_FILE[s],
      vibrationPattern: s === 'loud' ? [0, 300, 150, 300] : [0, 120],
    });
  }
  await Notifications.setNotificationChannelAsync('focus', {
    name: 'Focus timer',
    importance: AndroidImportance.HIGH,
    sound: SOUND_FILE.chime,
  });
  channelsReady = true;
}

export async function notificationsAllowed(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const p = await Notifications.getPermissionsAsync();
  return p.granted || p.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}

/** Only call after the soft pre-prompt ("yes, gentle nudges"). Never on first launch. */
export async function askNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  await ensureChannels(); // Android 13 needs a channel before the prompt
  const r = await Notifications.requestPermissionsAsync();
  return r.granted;
}

/**
 * Rebuild every scheduled nudge from the current state. Called on launch, on foreground and
 * when nudge settings or reminders change. Focus-end notifications are separate (focus.ts).
 */
export async function rescheduleNudges(state: PersistedState, now = new Date()) {
  if (!(await notificationsAllowed())) return;
  await ensureChannels();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind !== 'focus')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  const { settings, pet, reminders, bites } = state;
  const plan = planNudges({
    level: settings.nudge,
    quietStart: settings.quietStart,
    quietEnd: settings.quietEnd,
    now,
    reminders,
    biteTimes: biteTimes(bites, now),
    time: settings.nudgeTime,
  });
  const sound = settings.nudgeSound;
  for (const p of plan) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: p.kind === 'leaving' ? `${pet.name} · heads up` : pet.name || APP_NAME,
        body: p.text,
        sound: SOUND_FILE[sound],
        // a bite time opens that bite's start sheet on Home (same link as the widget's Start)
        data: { kind: p.kind, url: p.biteId ? `/?start=${p.biteId}&at=${+p.at}` : '/' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.at, channelId: channelId(sound) },
    });
  }
}

/** Focus end: "time's up" in case the app is in the background (docs/01). */
export async function scheduleFocusEnd(endsAt: number, petName: string): Promise<string | null> {
  if (!(await notificationsAllowed())) return null;
  await ensureChannels();
  return Notifications.scheduleNotificationAsync({
    content: { title: `${petName} is done`, body: 'Time’s up! Come feed me.', sound: SOUND_FILE.chime, data: { kind: 'focus', url: '/focus' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endsAt), channelId: 'focus' },
  });
}

export async function cancelNotification(id: string | null | undefined) {
  if (id && Platform.OS !== 'web') await Notifications.cancelScheduledNotificationAsync(id);
}
