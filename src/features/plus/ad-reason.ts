/** Pure helpers for the ad reason codes (shown only in non-store builds). */

/** A short single-line text from anything thrown. */
export function shortError(e: unknown, max = 80): string {
  const raw = e instanceof Error ? e.message : typeof e === 'string' ? e : (e as { message?: unknown } | null)?.message;
  const text = String(raw ?? 'unknown').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** The code of a Google ad error (AdEventType.ERROR payload), or 'unknown'. */
export function adErrorCode(e: unknown): string {
  const code = (e as { code?: unknown } | null)?.code;
  return code === undefined || code === null ? 'unknown' : String(code);
}

/**
 * When the consent form flow throws, Google's advice is to carry on with what the last
 * consent info says: only stop when consent is REQUIRED and not yet given.
 */
export function canContinueAfterConsentError(status: string | undefined): boolean {
  return status !== 'REQUIRED';
}

/** The consent note (if any) and the failure, as one short line. */
export function joinReasons(note: string | null, failure: string | null): string | null {
  const parts = [note, failure].filter((x): x is string => !!x);
  return parts.length ? parts.join(' | ') : null;
}
