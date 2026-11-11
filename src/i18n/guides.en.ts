import { APP_NAME } from '@/config/app';
import { MONETIZATION, PLUS_VISIBLE } from '@/config/monetization';

/**
 * Page guides: 2–4 short steps per page, each with a little pet demo (components/guide).
 * `{pet}` is replaced with the pet's name. Sentence case, warm, no guilt words.
 * Toolkit tools open their guide by themselves the first time; every page reopens it with "?".
 */
export type DemoKind = 'list' | 'drag' | 'timer' | 'sparkle' | 'tap' | 'shake' | 'breathe';
export type GuideStep = { demo: DemoKind; title: string; body: string };

const android = MONETIZATION === 'ads';

export const GUIDES = {
  home: [
    { demo: 'list', title: 'Add a bite', body: 'Type a task. I guess its icon and size as you type. Tap the chips to change the size or pick when.' },
    { demo: 'drag', title: 'Feed {pet}', body: 'Hold a bite and drag it to {pet}, or just tap it to start. Hold still for more.' },
    { demo: 'timer', title: 'Two minutes counts', body: 'Starting is the whole trick. Even 2 minutes feeds {pet}.' },
    { demo: 'tap', title: 'Later and tools', body: 'Bites for later wait folded under the list. The toolbox up top has calm-down and get-unstuck tools.' },
  ],
  dump: [
    { demo: 'list', title: 'Empty your head', body: 'Type everything, messy is fine. New lines, commas and “and then” split it into bites.' },
    { demo: 'tap', title: 'Fix what’s off', body: 'Tap an icon to change the size, × to drop one you don’t need.' },
    { demo: 'drag', title: 'Serve it', body: 'Pick when they go (today, tomorrow, this week, someday), then serve. Today’s plate stays small.' },
  ],
  focus: [
    { demo: 'timer', title: 'The timer keeps going', body: 'Close the app if you want. The timer runs on and, with notifications on, pings you at the end.' },
    { demo: 'tap', title: 'Pause or add time', body: 'Pause, add 5 minutes or restart. Drifting off happens, just come back.' },
    { demo: 'sparkle', title: 'Done = fed', body: 'When you finish, {pet} eats the bite and you get sparks. Stopping early still counts the start.' },
  ],
  me: [
    { demo: 'sparkle', title: 'Sparks and levels', body: 'Starting and feeding earn sparks. Your level only goes up, never down.' },
    { demo: 'list', title: 'Your week', body: 'A count of bites that refills every week. Nothing to lose, nothing to break.' },
    { demo: 'tap', title: 'Settings', body: 'The gear opens Settings: nudges, sounds, theme, backup and the FAQ.' },
  ],
  road: [
    { demo: 'sparkle', title: 'Road to 20', body: 'Every level gives {pet} something new: a hat, a colour, a room or a face.' },
    { demo: 'shake', title: 'Five forms', body: '{pet} changes shape on the way to level 20, and there’s a surprise at the end.' },
  ],
  closet: [
    { demo: 'tap', title: 'Dress {pet}', body: 'Tap an item to put it on. Faces, hats, glasses, colours and rooms.' },
    {
      demo: 'sparkle',
      title: 'Locked items',
      body: android
        ? 'Most open as you level up. Want one sooner? Tap it and buy just that item with sparks. A free new colour arrives every week.'
        : PLUS_VISIBLE
          ? 'Most open as you level up. A few are part of Plus. You can also buy a single item with sparks. A free new colour arrives every week.'
          : 'They open as you level up, or you can buy one item at a time with sparks. A free new colour arrives every week.',
    },
    { demo: 'shake', title: 'Pick a face', body: 'The face you choose is {pet}’s face on Home. “Auto” reacts to your day.' },
  ],
  spin: [
    { demo: 'shake', title: 'Can’t choose?', body: 'Spin and let {pet} pick a bite from your plate.' },
    { demo: 'timer', title: 'Then just start', body: 'Take what it lands on and start 2 minutes. Deciding is the hard part, and it’s done.' },
  ],
  tools: [
    { demo: 'list', title: 'Tools for hard moments', body: 'Small helpers for when starting feels impossible. All free, no limits.' },
    { demo: 'tap', title: 'Pick by feeling', body: 'Stuck? Unstick me. Wound up? Calm. Working alone? Sit with me, at the top.' },
  ],
  breathe: [
    { demo: 'breathe', title: 'Breathe in', body: 'Breathe in while {pet} grows.' },
    { demo: 'breathe', title: 'Breathe out', body: 'Breathe out while {pet} shrinks. Soft buzzes keep time if your eyes are closed.' },
    { demo: 'tap', title: 'Pick a rhythm', body: 'Calm, box or 4-7-8. Stop any time, even one breath helps.' },
  ],
  calm: [
    { demo: 'list', title: '5-4-3-2-1', body: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.' },
    { demo: 'shake', title: 'Shake it out', body: '20 seconds of shaking your hands and shoulders. It looks silly and it works.' },
    { demo: 'tap', title: 'Stroke {pet}', body: 'Slow strokes on {pet}. Nothing to finish, nothing to win.' },
  ],
  unstick: [
    { demo: 'shake', title: 'Stuck?', body: 'I give you one tiny body step, like “stand up” or “open the laptop”.' },
    { demo: 'tap', title: 'Not that one?', body: 'Ask for another until one feels doable.' },
    { demo: 'timer', title: 'Go', body: 'Add it as a bite, or start 2 minutes right away.' },
  ],
  sit: [
    { demo: 'timer', title: 'A study buddy', body: '{pet} sits and works next to you, so you’re not alone with the task.' },
    { demo: 'tap', title: 'Pick a length', body: '10, 25 or 45 minutes, or no limit.' },
    { demo: 'sparkle', title: 'Soft check-ins', body: 'Every 10 minutes {pet} checks in quietly. No pressure, no score.' },
  ],
  tip: [
    { demo: 'sparkle', title: 'One tip a day', body: 'A new small tip every pet day, from everyday life. Not medical advice.' },
    { demo: 'tap', title: 'Keep the good ones', body: 'Save tips you like and share them with a friend.' },
  ],
  reminders: [
    { demo: 'timer', title: 'Leave on time', body: '“I leave at” pings you ahead, so time blindness doesn’t make you late.' },
    { demo: 'tap', title: 'Remind me at', body: 'A ping at the time you pick. “Every day” repeats it.' },
    { demo: 'list', title: 'Always on', body: 'You asked for these, so they ping even in quiet hours.' },
  ],
  settings: [
    { demo: 'list', title: 'One topic per page', body: 'Look, sound, nudges, focus, your pet, time, privacy.' },
    { demo: 'tap', title: 'Nudges your way', body: 'How often, what time of day and quiet hours, all in Notifications.' },
    { demo: 'sparkle', title: 'Questions?', body: 'The FAQ at the bottom answers the usual ones: data, backup, widgets, money.' },
  ],
  plus: android
    ? [
        { demo: 'sparkle', title: 'Earned, not bought', body: 'Spend sparks on single Closet items, or save 150 to open all of Plus. No payments, no subscription.' },
        { demo: 'list', title: 'The basics stay free', body: 'Bites, focus, feeding, brain dump, the toolkit and reminders are free for good.' },
        { demo: 'tap', title: 'Your level is safe', body: 'Spending sparks never lowers your level.' },
      ]
    : [
        { demo: 'sparkle', title: 'Small extras', body: `One unlock you buy once to make ${APP_NAME} more yours. No subscription.` },
        { demo: 'list', title: 'The basics stay free', body: 'Bites, focus, feeding, brain dump, the toolkit and reminders are free for good.' },
        { demo: 'tap', title: 'New phone?', body: 'Restore purchases is at the bottom of the page.' },
      ],
} satisfies Record<string, GuideStep[]>;

export type GuideId = keyof typeof GUIDES;

/** Short names for the guide list in Settings > Questions & answers. */
export const GUIDE_NAMES: Record<GuideId, string> = {
  home: 'Your plate and feeding',
  dump: 'Brain dump',
  focus: 'Focus timer',
  me: 'Your progress',
  road: 'The road to level 20',
  closet: 'Dressing your pet',
  spin: 'Pick for me',
  tools: 'The toolbox',
  breathe: 'Breathe',
  calm: 'Calm',
  unstick: 'Unstick me',
  sit: 'Sit with me',
  tip: 'The daily tip',
  reminders: 'Reminders',
  settings: 'Settings',
  plus: android ? 'Plus and sparks' : 'Plus',
};

export const guideCopy = {
  howSection: 'How things work',
  faqSection: 'Common questions',
  help: 'How this page works',
  next: 'Next',
  back: 'Back',
  done: 'Got it',
  close: 'Close guide',
  step: (i: number, n: number) => `Step ${i} of ${n}`,
};
