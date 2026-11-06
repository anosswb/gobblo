# CLAUDE.md — Gobblo (formerly "Nomling")

> **Name update 2026-11-06:** the app is now **Gobblo** (see DECISIONS.md). Older docs still say "Nomling": read it as Gobblo. Code takes the name only from `src/config/app-identity.json` via `APP_NAME`.

You are building **Nomling**, an iOS + Android app made with **Expo (React Native)**.
Owner: Anass (solo founder, Morocco). He is not a native English speaker: keep messages to him short and simple, and explain any step he must do by hand (accounts, payments, store forms) one step at a time.

## One-line pitch
A cute pet that eats your to-do list. You feed it by **starting** tasks, even 2 minutes counts. Built for ADHD brains (Gen Z, 16–30), no shame, no nagging.

## Read these before writing code (in this order)
1. `docs/01-product-spec.md` — what to build, every screen and state
2. `docs/02-design-system.md` — tokens, light + dark mode, type, icons, mascot
3. `docs/03-motion-and-feel.md` — animation, haptics, sound recipes
4. `docs/04-architecture.md` — stack, folders, data, libraries
5. `docs/05-store-rules.md` — App Store + Google Play rules. NON-NEGOTIABLE.
6. `docs/06-money-plan.md` — what to sell, where (Morocco limits!)
7. `docs/07-entrepreneur-findings.md` — what users hate in Finch/Tiimo/Structured, from real reviews. Every product decision should beat these.
8. `docs/08-launch-and-listing.md` — builds, testers, store listing
8b. `docs/09-paid-features.md` — what we sell (iOS Plus) and what ads unlock (Android)
8d. `docs/11-art-direction.md` — the chosen "lo-fi jelly" look and which Flow image goes where (READ before any UI work)
8c. `docs/10-image-prompts.md` — the art Anass generates in Google Flow; images land in `assets/flow/`
9. `reference/prototype.html` — a WORKING web prototype. Open it in a browser. Match its feel, flows and copy tone. Rebuild natively, do not wrap it in a WebView (Apple rejects thin web wrappers, guideline 4.2). The prototype (v0.2) already has light/dark mode, the transitions.dev motion tokens, Phosphor icons, the iPhone Plus paywall and the Android rewarded-ad flow (switch "store version" in Me › settings). Real design references are in `reference/design-refs/` (transitions.dev tokens, Screenrove motion guidelines, Screenrove Duolingo design guide + polish suggestions).

## Tools to use (install once, see START_HERE.md)
- **Expo plugin for Claude Code** (`expo@claude-plugins-official`): official Expo Skills + the **Expo MCP server**. Use it to read the current Expo docs before using any API (your training data may be older than SDK 58), to run EAS builds/workflows and read their logs, and, where available, to drive a simulator, take screenshots and collect app logs so you can SEE what you built. Check that a tool exists before relying on it; some are paid or billed.
- **Screenrove MCP** (`screenrove`): real screens from Duolingo, Airbnb, etc.
  - Before designing a screen: `search_screens` / `get_flow` (e.g. Duolingo onboarding, paywalls, empty states, settings).
  - For motion: `get_motion_guidelines`, `search_motion`, `get_motion`, `suggest_polish`.
  - After building a screen: `check_my_ui` with a screenshot, then fix what it flags.
  - Use references for patterns and quality bar only. Never copy another app's assets, logo or text.
- **transitions.dev skill** (`npx skills add Jakubantalik/transitions.dev`): its recipes are **CSS for the web**. In React Native, use them as the motion spec (durations, easing curves, distances, blur/scale values) and rebuild them with Reanimated. Mapping table in `docs/03-motion-and-feel.md`.
- **replica-skill** (`/plugin marketplace add Jakeschincariol/replica-skill`):
  - `/replica-entrepreneur` already ran (results in `docs/07` and `research/`). Re-run it later on new competitors if Anass asks.
  - `/replica-test` to write and run the flow test plan before each release.
  - `/replica-launch` → run its `listing.py` on our store listing JSON before submitting.
  - We are NOT cloning one app. Do not run recon/build against a competitor. Never copy their names, copy, art or code.
- **mobile-app-ui-design skill** (github.com/ceorkm/mobile-app-ui-design) if installed: follow its 8-pt grid, 60/30/10 color, thumb zone and peak-end rules.

## Hard rules
- **Expo SDK 58** (React Native 0.88, iOS 27 SDK). Always add packages with `npx expo install <pkg>` so versions match the SDK. TypeScript strict. React Native's Strict TypeScript API is the default in 0.87+: no deep imports from `react-native/Libraries/*`.
- **New Architecture only.** No libraries that need the old architecture.
- **No accounts, no backend in v1.** All data stays on the device (MMKV). No login screen. That also means no account-deletion requirement.
- **No WebView screens**, except opening the privacy policy/terms in the browser.
- **Light + dark mode** everywhere, following the system by default, with a Settings override (System / Light / Dark). Every color comes from theme tokens. No hard-coded hex colors in components.
- **Accessibility:** tap targets ≥ 44×44 pt, Dynamic Type / font scaling respected (cap at 1.4×), `accessibilityLabel` on every icon button, honor Reduce Motion (swap big motion for fades).
- **No medical claims.** Never write "treats", "cures", "manages ADHD", "clinically proven". OK: "made for ADHD brains", "for brains that struggle to start". Add "Nomling is not a medical device" in Settings > About.
- **Notifications are local only and capped** (see spec). Never more than the user's chosen level.
- **Paywall rules:** never inside onboarding, never blocking the core loop (add task → start → feed). Always show price, what you get, Restore Purchases, Terms and Privacy links.
- **Rating prompt:** only via `expo-store-review`, only after the 3rd fed task AND at least 2 days after install, max once per app version. Never in the first session.
- **Money per platform** (docs/06): `MONETIZATION = Platform.select({ ios: 'iap', android: 'ads' })`. Android = AdMob ads only (rewarded first, never in onboarding, Focus, Feed, Evolution or Brain dump). iOS = one-time Plus purchase via RevenueCat, no ads. Use Google's TEST ad unit IDs in development, real IDs only in the production profile via env vars.
- **App name is a constant** (`src/config/app.ts` → `APP_NAME`). The name may change after the trademark check, so never hard-code it in copy.
- Copy tone: sentence case (capital first letter of every sentence, "I", proper acronyms like ADHD and Face ID; Anass's call 2026-11-06, see DECISIONS.md), warm, short, Gen-Z but not cringe. No guilt words ("failed", "missed", "lost your streak").

## How to work
- **Plan first.** For every phase or bigger feature: use plan mode, read the relevant docs, look at references (Screenrove, Expo docs), write the plan in `PROGRESS.md`, then build.
- **You own the product quality.** The docs are the minimum, not the ceiling. You may improve the spec when you find a better pattern (from Screenrove references, Expo docs, or the review evidence in docs/07). Write each change and the reason in `DECISIONS.md`. Never break the hard rules above.
- **Set up guardrails early (Phase 1):** `.claude/settings.json` permissions (allow `npx expo install *`, `npx tsc --noEmit *`, lint and tests; ask before `git push`, `eas *` and `npx expo prebuild`; deny `rm -rf *`, `git reset --hard *` and reading `.env*`), a PostToolUse hook that runs `tsc --noEmit` + eslint on edited .ts/.tsx files, and `.claude/rules/*.md` with `paths:` frontmatter for screen, animation and store rules. Create project skills in `.claude/skills/` for jobs you repeat (`/add-screen`, `/polish-screen`, `/release-check`).
- **Use subagents** for side jobs: one to review a finished screen against docs/02 + docs/03, one to check store rules against docs/05 before each build.
- **Look at your work.** Screenshot every new screen (simulator via the Expo MCP, or ask Anass for a phone screenshot) in light + dark, compare it with `reference/prototype.html` and the Screenrove references, and fix it before moving on.
- **E2E tests with Maestro** for the core loop (onboarding → dump → drag-to-feed → 2-min focus → feed) and run them before every build.
- Build in the phases in `START_HERE.md`. One phase at a time. At the end of each phase: run `npx expo-doctor`, `npx tsc --noEmit`, the linter, the tests, and launch the app. Then tell Anass in 3–5 short lines what works and what to try on his phone.
- After each new screen: screenshot it in light AND dark, run Screenrove `check_my_ui`, fix, then move on.
- Keep a `PROGRESS.md` (done / next / blocked).
- When something needs Anass (an account, a payment, a store form), stop and give him numbered steps with exact button names.
- Commit after every working step with a clear message.

## Definition of done (per screen)
States designed: loading, empty, error, success. Light + dark checked. Works at small (iPhone SE / 360dp Android) and big screens. Haptics + sound on key actions (respecting the sound toggle). Reduce Motion fallback. No layout jump on keyboard open. Back gesture works (Android back button too).
