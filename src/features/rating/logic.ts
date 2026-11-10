/** CLAUDE.md hard rule: ask for a rating only after the 3rd fed bite, 2+ days after install, once per app version. */
export const RATING_MIN_EATEN = 3;
export const RATING_MIN_DAYS = 2;

export interface RatingInput {
  eaten: number;
  firstOpen: number;
  askedVersion: string | undefined;
  version: string;
  now: number;
}

export function shouldAskRating({ eaten, firstOpen, askedVersion, version, now }: RatingInput): boolean {
  return eaten >= RATING_MIN_EATEN && now - firstOpen >= RATING_MIN_DAYS * 86_400_000 && askedVersion !== version;
}
