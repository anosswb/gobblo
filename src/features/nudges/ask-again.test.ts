import { freshState } from '@/state/schema';

import { shouldAskNudgeAgain } from './ask-again';

const DAY = 86_400_000;
const said = (over: Partial<ReturnType<typeof freshState>['settings']> = {}) => ({ ...freshState(0).settings, onboarded: true, nudge: 'off' as const, ...over });

describe('ask about nudges again', () => {
  it('waits until day 3', () => {
    expect(shouldAskNudgeAgain(said(), 1.5 * DAY)).toBe(false);
    expect(shouldAskNudgeAgain(said(), 2 * DAY)).toBe(true);
  });
  it('asks only once, and only if nudges are off', () => {
    expect(shouldAskNudgeAgain(said({ nudgeAskedAgain: true }), 5 * DAY)).toBe(false);
    expect(shouldAskNudgeAgain(said({ nudge: 'gentle' }), 5 * DAY)).toBe(false);
    expect(shouldAskNudgeAgain(said({ onboarded: false }), 5 * DAY)).toBe(false);
  });
});
