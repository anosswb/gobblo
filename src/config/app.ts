/**
 * App identity. Name chosen 2026-11-06: "Gobblo" ("Nomling" failed the name check,
 * docs/brand-name-check.md). Never hard-code the name in copy, always use APP_NAME.
 */
import identity from './app-identity.json';

/** Edit app-identity.json (app.config.ts reads it too). */
export const APP_NAME: string = identity.name;

/** Bundle ID / package. Decide before the first store upload: it can never change after. */
export const APP_ID: string = identity.id;

export const APP_SCHEME: string = identity.scheme;

export const LINKS = {
  privacy: 'https://example.com/privacy', // TODO(phase 6): GitHub Pages URL
  terms: 'https://example.com/terms', // TODO(phase 6): GitHub Pages URL
  supportEmail: 'support@example.com', // TODO: Anass's support address
} as const;
