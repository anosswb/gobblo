import type { Settings } from '@/state/schema';

/** Ask again no sooner than day 3 (panel: "Not now" in onboarding is often just habit). */
export const ASK_AGAIN_AFTER_DAYS = 2;

/**
 * Ask about nudges one more time, once: only if nudges are off (the user tapped "Not now" in
 * onboarding), on day 3 or later, for someone who has fed at least one bite. It is asked when the
 * app opens, never in the same visit as a feed: the feeding moment belongs to the pet (docs/15).
 * The OS prompt comes only after a "yes" on the soft card.
 */
export function shouldAskNudgeAgain(
  s: Pick<Settings, 'nudge' | 'nudgeAskedAgain' | 'firstOpen' | 'onboarded'>,
  now = Date.now(),
  visit: { eaten: number; fedThisVisit: boolean } = { eaten: 1, fedThisVisit: false },
): boolean {
  if (visit.fedThisVisit || visit.eaten < 1) return false;
  return s.onboarded && s.nudge === 'off' && !s.nudgeAskedAgain && now - s.firstOpen >= ASK_AGAIN_AFTER_DAYS * 86_400_000;
}
