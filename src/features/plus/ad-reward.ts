/** Videos watched on one pet day (Stats.adSparks). */
export interface AdSparks {
  day: string;
  count: number;
}

export const adsWatchedToday = (a: AdSparks | undefined, today: string) => (a && a.day === today ? a.count : 0);

export const adsLeftToday = (a: AdSparks | undefined, today: string, max: number) => Math.max(0, max - adsWatchedToday(a, today));

/** The counter after one more finished video, or null when today's limit is already reached. */
export function afterAd(a: AdSparks | undefined, today: string, max: number): AdSparks | null {
  const seen = adsWatchedToday(a, today);
  return seen >= max ? null : { day: today, count: seen + 1 };
}
