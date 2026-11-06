import { APP_NAME } from '@/config/app';

/** All UI strings live here (fr/es/ar later; use start/end styles, never left/right). */
export const en = {
  tabs: { home: 'home', spin: 'spin', dump: 'dump', closet: 'closet', me: 'me' },
  a11y: {
    dumpButton: 'brain dump: add bites',
    tab: (name: string) => `${name} tab`,
  },
  placeholder: {
    home: 'what are we eating today?',
    spin: 'can’t pick? spin it.',
    closet: 'the closet',
    me: `you + ${APP_NAME}`,
    dump: 'dump your brain. messy is perfect.',
    soon: 'coming in the next phase',
  },
  settings: {
    theme: 'theme',
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
} as const;
