# 19 — Anonymous analytics (PostHog) and crash reports (Sentry)

Spec: docs/16 point 12. Decision: DECISIONS.md (2026-11-11). Code: `src/lib/analytics.ts`,
`src/lib/analytics-events.ts` (the closed event list), `src/lib/analytics-store.ts`,
`src/lib/crash.ts`, `src/hooks/use-analytics.ts`. Test: `src/lib/analytics.test.ts`.

## The rules (enforced in code)

- **Anonymous.** PostHog's random install id only. No `identify`, no `alias`, `personProfiles: 'never'`.
- **No autocapture** (we never mount `PostHogProvider`), **no session replay**, no app-lifecycle
  events, no feature flags, no surveys, no push-token capture. PostHog's error tracking is off
  (Sentry does crashes).
- **No free text, ever.** Event names come from a closed list. Each prop is a boolean, a number or
  one value from a short list written in `analytics-events.ts`. `clean()` drops anything else, and
  PostHog's `before_send` drops any event that is not ours and any person properties
  (`$set`, `$set_once`) and the device name. The jest test fails if a prop could be typed `string`,
  or if a free-text value gets through.
- **Language** is sent as 2 letters only ("en"). **Country** comes from PostHog's GeoIP on their
  side; nothing is sent for it. **No advertising ID.**
- **Sentry:** `sendDefaultPii: false`, no user, **no breadcrumbs at all**, no screenshots, no view
  hierarchy, no replay, tracing off (0), no session tracking. `beforeSend` removes `user`,
  `request`, `extra`, `breadcrumbs`, plain messages, log entries, the device name and any `state`
  context, and cuts error values to 200 characters.
- **Off when the key is missing.** No `EXPO_PUBLIC_POSTHOG_KEY` → analytics off. No
  `EXPO_PUBLIC_SENTRY_DSN` → crash reports off. Web preview and jest: always off.

## The switch

**Settings › Privacy & data › Share anonymous usage** (`settings.shareUsage`, default on; old saves
load with it on). Off → PostHog `optOut()` and Sentry's `beforeSend` returns null. The last
onboarding step (nudges) has one line: "Gobblo counts anonymous taps to get better. You can turn
it off in Settings."

## Events

| Event | Props | Sent from | Why |
|---|---|---|---|
| `app_opened` | `first_open` (bool: before onboarding is done) | use-analytics (start + back to foreground) | users per day, day 1/7/30 return |
| `session_end` | `seconds` (bucket: 10, 30, 60, 120, 300, 600, 1200, 1800, 3600, 3601+) | use-analytics (app to background) | session length |
| `screen` | `name` (fixed list of route names, never params) | use-analytics (router path) | most-used screens, first screen |
| `onboarding_step` | `step` (hook, quiz, feed, hatch, name, nudge), `index` | **not wired yet**: needs one line in `src/screens/onboarding/index.tsx` `go()` | where people quit onboarding |
| `onboarding_done` | `nudges_on` (bool) | store `updateSettings` (onboarded false → true) | onboarding finish rate |
| `bite_added` | `source` (home, dump, unstick, onboarding, routine), `size` (0–3) | store `addBites` | how bites get in |
| `focus_started` | `minutes`, `preset` (2min, 15, 25, custom), `source` (bite, free) | store `startFocus` | timer use, 2-minute start |
| `focus_ended` | `outcome` (done, left, expired), `minutes` (bucket) | store `endFocus` | finish rate |
| `bite_fed` | `size`, `sparks`, `how` (timer, already_done) | store `endFocus` / `feedDone` | the core loop |
| `level_up` | `level` | store (lifetime sparks went up) | progression |
| `tool_opened` | `tool` (unstick, calm, pick, reminders, other) | use-analytics (`/tools/<id>`) | toolkit use |
| `closet_item_got` | `slot` (hat, face, color, room, pack), `how` (level, sparks, plus, weekly) | store (level rewards, Plus unlock) | what motivates |
| `theme_picked` | `palette` (the 5 palettes) or `scheme` (system, light, dark) | store `updateSettings` | theme popularity |
| `ad_offer_shown` | `left` (videos left today) | `src/screens/plus/video-treat.tsx` | Android offer reach |
| `ad_result` | `result` (earned, closed, unavailable), `reason` (code prefix only) | `src/lib/ads.android.ts` | ad fill + the "No video" bug |
| `plus_seen` | none | use-analytics (`/plus`) | paywall reach |
| `plus_bought` | none | `src/lib/purchases.ios.ts` | conversions |
| `plus_restored` | `found` (bool) | `src/lib/purchases.ios.ts` | restore works |
| `nudges_choice` | `level` (off, gentle, normal, chaos) | store `updateSettings` | nudge opt-in |
| `settings_changed` | `key` (allow-listed setting names, never the value) | store `updateSettings` | which settings matter |
| `rating_prompted` | none | `src/lib/rating.ts` | rating prompt count |

The weekly closet drop (`how: 'weekly'`) is not sent yet: it would come from
`src/screens/home/weekly-card.tsx`.

Adding an event: add it to `EVENTS` in `analytics-events.ts` (only 'bool', 'num' or a short list of
values), call `track()` from a store action or a lib file, add a row here, run the tests.

## What is never sent

Anything typed: bite text, brain dumps, reminder text, good-things notes, the pet's name, file
names. No name, email, contacts, photos, exact location, advertising ID. No screen recordings,
screenshots, tap targets or on-screen text.

## Env var names (values never go in the repo)

| Name | Where | Notes |
|---|---|---|
| `EXPO_PUBLIC_POSTHOG_KEY` | app (inlined at bundle time) | PostHog project API key. Public by design, still kept out of the repo |
| `EXPO_PUBLIC_POSTHOG_HOST` | app | optional, default `https://eu.i.posthog.com` |
| `EXPO_PUBLIC_SENTRY_DSN` | app | Sentry DSN |
| `SENTRY_AUTH_TOKEN` | build machine only | source-map upload. Secret. Never in app code, `extra` or a file |
| `SENTRY_ORG` | build machine only (GitHub **variable**, not secret) | optional org slug, if the upload asks for it |

Local: copy `.env.example` to `.env.local`. EAS: add the same names on expo.dev
(**Project › Environment variables**, `SENTRY_AUTH_TOKEN` with "Secret" visibility).

## GitHub secrets (Anass, one time)

Only `android-preview.yml` (the release APK) reads them; the dev APK and the iOS check do not need
them. Without them the build still works: analytics and crash reports are just off, and
`app.config.ts` switches the Sentry upload off when `SENTRY_AUTH_TOKEN` is empty.

```sh
gh secret set EXPO_PUBLIC_POSTHOG_KEY
gh secret set EXPO_PUBLIC_SENTRY_DSN
gh secret set SENTRY_AUTH_TOKEN
gh variable set SENTRY_ORG   # optional: your Sentry organization slug
```

Each `gh secret set` asks you to paste the value. Or on GitHub: **repo › Settings › Secrets and
variables › Actions › New repository secret**.

Also, once, in the provider dashboards:
1. PostHog › **Settings › Project › General** › turn on **Discard client IP data**.
2. Sentry › **Project settings › Security & Privacy** › turn on **Prevent storing of IP addresses**
   and keep **Data scrubber** on.

## Store forms (paste in December)

**Google Play › App content › Data safety** (add to the AdMob answers in docs/17):

- Data collected: **App activity › App interactions**; **App info and performance › Crash logs**
  and **Diagnostics**; **Device or other IDs** (the random install id).
- Shared with third parties: **No** (PostHog and Sentry are service providers processing for us).
- Processed ephemerally: No. Encrypted in transit: **Yes**.
- Users can request deletion / opt out: **Yes, users can turn it off** (Settings switch).
- Collection required or optional: **Optional** (user can turn it off).
- Purpose: **Analytics** (app interactions, IDs) and **App functionality / Analytics** (crash
  logs, diagnostics). Not used for advertising or marketing.

**App Store Connect › App Privacy:**

- **Usage Data › Product Interaction**: collected, **not linked to you**, **not used for
  tracking**, purpose **Analytics**.
- **Diagnostics › Crash Data** (and **Other Diagnostic Data**): collected, **not linked to you**,
  **not used for tracking**, purpose **App Functionality**.
- No App Tracking Transparency pop-up is needed (no tracking, no IDFA).

## Done when (needs a new build)

These are native packages (`@sentry/react-native`), so a new dev build / APK is needed. Then:
events show in PostHog from a phone; a forced test crash shows in Sentry; the switch really stops
sending. None of this can be proven without a real build.
