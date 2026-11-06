---
paths:
  - "src/features/purchases/**"
  - "src/features/ads/**"
  - "src/features/nudges/**"
  - "src/app/paywall*.tsx"
  - "app.config.ts"
  - "store/**"
---
# Store rules (docs/05 is the source of truth)
- No medical claims anywhere ("made for ADHD brains" is OK). Settings › About says "not a medical device".
- Paywall: never in onboarding, never blocks dump → start → feed. Shows price, "one-time · no subscription", what you get, Restore Purchases, Terms, Privacy. No free trial. "Plus is yours forever."
- Ads (Android only): rewarded, opt-in, reward only on EARNED_REWARD, test IDs in dev, max 3/day, UMP consent first. Never in onboarding, Focus, Feed, Evolution or Brain dump.
- Notifications: local only, capped by nudge level, quiet hours 22–08, one comeback note max.
- Rating prompt: expo-store-review only, after 3rd fed bite AND ≥ 2 days, once per version.
- No "Android" in iOS metadata, no competitor names in the app or listing.
