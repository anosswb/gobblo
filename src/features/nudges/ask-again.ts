import type { Settings } from '@/state/schema';

/** Ask again no sooner than day 3 (panel: "Not now" in onboarding is often just habit). */
export const ASK_AGAIN_AFTER_DAYS = 2;

/**
 * Ask about nudges one more time, once: only if nudges are off (the user tapped "Not now" in
 * onboarding), on day 3 or later, right after a bite was fed. The OS prompt comes only after a
 * "yes" on the soft card.
 */
export function shouldAskNudgeAgain(s: Pick<Settings, 'nudge' | 'nudgeAskedAgain' | 'firstOpen' | 'onboarded'>, now = Date.now()): boolean {
  return s.onboarded && s.nudge === 'off' && !s.nudgeAskedAgain && now - s.firstOpen >= ASK_AGAIN_AFTER_DAYS * 86_400_000;
}
