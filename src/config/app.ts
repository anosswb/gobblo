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
  // published from legal/ by .github/workflows/legal-pages.yml (GitHub Pages)
  privacy: 'https://anosswb.github.io/gobblo/privacy',
  terms: 'https://anosswb.github.io/gobblo/terms',
  supportEmail: 'anasskraifa79@gmail.com',
} as const;
