import { APP_NAME } from '@/config/app';
import { MONETIZATION } from '@/config/monetization';

/**
 * Settings › FAQ. Short, honest answers (no medical claims, nothing promised that isn't built).
 * Platform-specific where money differs (docs/06): iPhone sells one-time packs, Android earns them.
 */
const android = MONETIZATION === 'ads';

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Where are my tasks saved?',
    a: `Only on this phone. ${APP_NAME} has no account and no server, so nobody else can read your bites.`,
  },
  {
    q: 'What if I lose or change my phone?',
    a: 'Your data rides along in your phone’s own backup (iCloud or Google) and comes back on a new phone. Switching between iPhone and Android? Use Export backup in Privacy & data, then Import on the new phone.',
  },
  {
    q: 'Can I use it on my laptop or sync two phones?',
    a: 'Not yet. Sync needs accounts and a server, which v1 doesn’t have on purpose. It’s on the list for a later version.',
  },
  {
    q: 'How do “when” and times work?',
    a: 'Tomorrow and This week bites wait in “bites for later” and come onto your plate on their day. Someday waits until you move it. A time sends one ping, never in quiet hours. Your own times don’t count toward your nudge limit.',
  },
  {
    q: 'How many notifications will I get?',
    a: 'Your pet’s own nudges never go past your level: Gentle 1 a day, Normal 2, Chaos 4. None in quiet hours. Away for 3 days? One “I napped” note, then silence. Reminders and bite times you set yourself always ping (bite times not in quiet hours).',
  },
  {
    q: 'I never hear the nudges. Why?',
    a: 'On vibrate, soft sounds are easy to miss. Try the Loud sound in Settings › Notifications, and check that notifications are allowed for the app in your phone’s settings.',
  },
  {
    q: 'How do the widgets work?',
    a: android
      ? 'Add the widget from your home screen. It shows your next bite; Start opens it in the app. With Start Kit, Start begins 2 minutes in one tap.'
      : 'Add the widget from your home screen. It shows your next bite; Start opens it in the app. With Start Kit, Start begins 2 minutes in one tap, and the timer shows on the lock screen.',
  },
  {
    q: 'What do levels unlock?',
    a: 'Every level gives your pet something: a hat, a colour, a room or a face. It changes form 5 times on the way to level 20, with a surprise at the end. Levels never go down.',
  },
  {
    q: 'Does spending sparks lower my level?',
    a: 'No. Your level comes from all the sparks you ever earned. Spending only lowers the sparks you can spend.',
  },
  android
    ? {
        q: 'Is there anything to pay for?',
        a: 'No payments on Android. Packs are earned with sparks you get by starting bites. Bites, focus, feeding, brain dump, the toolkit and reminders are free for good.',
      }
    : {
        q: 'What is Plus?',
        a: 'Small packs you buy once, no subscription, offered only after your first week. Bites, focus, feeding, brain dump, the toolkit and reminders are free for good. Restore purchases is at the bottom of the Plus page.',
      },
  {
    q: 'Do I lose anything if I skip days?',
    a: 'No. There’s no streak to break. Your pet naps and is happy to see you when you come back.',
  },
  {
    q: `Is ${APP_NAME} a medical app?`,
    a: `No. ${APP_NAME} is not a medical device. It’s a productivity app made for ADHD brains. If you need support, talk to a professional you trust.`,
  },
  {
    q: 'How do I delete my data?',
    a: 'Settings › Privacy & data › Reset everything deletes all bites, stats and your pet from this phone. Deleting the app does the same.',
  },
  {
    q: 'Can it break a big task into steps for me?',
    a: 'You can: open the bite and tap “Break it into steps”, then type the tiny steps. There’s no AI in the app, so your tasks never leave your phone.',
  },
];
