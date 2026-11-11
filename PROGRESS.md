# PROGRESS.md

## Done
- Research phase (research/SUMMARY.md). Direction **A + C** picked.
- Anass's feature list sorted (docs/12).

## Phase 1: Foundation + guardrails — DONE except the phone build
Done: SDK 58 app (RN 0.88.1, React 19.3), src/app routes, theme A + C tokens, motion tokens, fonts, custom tab bar (plateau spring + raised FAB), MMKV + zustand persist + migrations (5 tests), app.config.ts, eas.json, .claude settings/hook/rules/skills. Checks: expo-doctor 20/20, tsc clean, lint clean, jest 5/5. Seen in the web preview in light + dark.
Not done: dev build on Anass's phone (needs `eas login` + Apple/Google accounts), Maestro (needs Java; flows come with Phase 3 screens).

### Phase 1 plan (as written before building)
1. Create the Expo SDK 58 app in this folder (create-expo-app, TypeScript, expo-router, `src/app` routes-only + `src/` code).
2. Install libraries from docs/04 with `npx expo install` (reanimated, worklets, gesture-handler, svg, skia, mmkv, zustand, fonts, phosphor, haptics, audio, linear-gradient, blur, dev-client…).
3. Theme: `src/theme/tokens.ts` (light + dark designed separately, direction A + C), `motion.ts` (transitions.dev + Screenrove specs from research/motion-specs.md), ThemeProvider with System / Light / Dark override.
4. Fonts: Bricolage Grotesque + Figtree, splash held until loaded.
5. Tab bar: custom, 5 tabs, raised dump FAB, sliding plateau (Screenrove interior-tabs spring 620/42/0.35), Phosphor icons.
6. Storage: one MMKV instance, `schemaVersion` + migrations, zustand persist; unit tests for migrations.
7. Config: `src/config/app.ts` (APP_NAME, links), `monetization.ts`, `app.config.ts`, `eas.json` (development / preview / production).
8. Guardrails: `.claude/settings.json` permissions, PostToolUse type-check + lint hook, `.claude/rules/*.md`, project skills `/add-screen`, `/polish-screen`, `/release-check`.
9. Checks: expo-doctor, tsc, lint, jest. Then the first dev build (needs Anass's Expo account + EAS).

## Phase 1.5: Anass's feature list (docs/12) — DONE (web preview checked; not yet on a phone)
- Home: add bites, food size, tap → start sheet (2/5/15/25), keep daily, delete + undo, one-thing mode, pet wisdom / mindful note, comeback line, time-of-day scene, sleepy pet at night.
- Focus: wall-clock ring timer (survives reload/kill), ends-at, pause, +5, 2-min "keep going", 2-min warning, drift, leave confirm, keep awake, end notification, rain / fire / autumn walk / brown noise.
- Me: stage, 4 stats, interactive week chart, weekly meter (never breaks), best hours, brain card share, good things jar.
- Settings: theme, 4 accents, reduce motion, confetti, sounds, volume, haptics, mix with music, nudge level + 4 sounds + quiet hours, leaving-soon reminders, default timer, focus sound, one-thing mode, pet talk, auto-sleep, mindful, jar, week start, 24 h, biometric lock, export/import backup, reset, about (not a medical device).
- Nudges: capped plan + quiet hours + one comeback note, Android channels per sound, iOS custom sounds. Original sounds from scripts/gen-sounds.py (CC0).
- Fixed: tab screens couldn't scroll (container height).
- Checks: tsc, lint, 28 tests, expo-doctor 20/20.
- Still later (needs a server): sync across devices, team boards (docs/12).

## Apple redesign (2026-11-06) — DONE in web preview (not yet on a phone)
- Tokens, type, Glass, Icon (SF Symbols / Phosphor), floating glass tab bar, large-title screens with blur header, inset-grouped lists, iOS switch + segmented, floating sheet, glass toasts.
- New pet rig with 18 moods from the emote sheet; Closet mood gallery; Spin + Dump placeholders restyled.
- Fixed: focus screen went back twice after finishing (GO_BACK warning).
- Checks: tsc, lint, 29 tests. expo-doctor 18/20 (the 2 fails are network timeouts to exp.host).

## Apple redesign, round 2+ (2026-11-06) — web preview checked
- Feeding moment (chomp → celebrate + burst), evolution scene (rays, flash, new stage), visible stages (ears / belly + tooth / aura).
- Brain dump (rule-based chop, 5 tests), Spin picker drum, swipe actions on bites, Reminders time capsule.
- Onboarding (hatch by feeding), pet name/colour + replay hatching in Settings, iOS icon tiles in Settings.
- App icon from the pet (scripts/gen-icons.py): iOS 26 Icon Composer layers + Android adaptive + themed.
- Drag-to-feed (hold the food, drag onto the pet), small-screen layouts (SE / 360 dp), motion audit, lint warnings 0.
- Needs a phone: swipe + drag gestures, Liquid Glass (iOS 26), SF Symbols, haptics feel, notification prompt, new icons/splash (need a new APK).

## Merge (2026-11-06)
- Two sessions merged into main: the Apple redesign is the base. Ported on top: "Play sounds on silent" (fixes no sound on vibrate), sentence-case copy everywhere (ADHD, I, typed bites), safe back (no GO_BACK error), saved settings deep-merged, and a "Make it yours" onboarding step (look + sound + haptics).
- Checks: tsc, lint, all tests. Web preview: full onboarding → Home, light + dark.
- Needs the phone: reload the app and test sound on vibrate.

## Toolkit hub (2026-11-08) — DONE in web preview (Anass OK'd the 6 tools; not yet on a phone)
Anass asked for a page of helpful ADHD tools: each tool is a tile, a tap opens its own page.

Research (short): docs/07 says starting is the unsolved pain and body doubling helps but the setup is friction (HN). Reddit r/ADHD threads (2026) put body doubling first, then "tiny physical first step" ("get my body there before my brain is ready"). Tools must stay few (docs/07: "few tools, not a toolbox").

The 6 tiles (all free, no ads on these pages):
1. **Reminders**: opens the existing "Leaving soon" page, now with two kinds: "Leave at" (nudge before) and "Remind me at" (plain), plus "every day". Same store, same `planNudges`.
2. **Breathe**: the pet grows and shrinks. Patterns: calm (4-6), box (4-4-4-4), 4-7-8. Soft haptic on each phase. Reduce Motion: fade + text only.
3. **Calm down** (stress relief): 3 short modes: 5-4-3-2-1 grounding steps, "shake it out" (20 s), "pet me" (stroke the pet, it purrs with haptics).
4. **Daily tip**: 60+ original, non-medical tips in `src/features/toolkit/tips.json`, picked by `dayKey` (same tip all day, new at 4 am). Save + share. Footer: "Tips from people, not medical advice."
5. **Unstick me** (picked): stuck? shows ONE tiny physical first step ("Stand up.", "Open the file. Just open it."). "Another one" and "Add as a bite" buttons.
6. **Sit with me** (picked): a body double without video. The pet sits and "works" next to you for 10/25/45 min or open-ended, soft check-in tap every 10 min. No task needed.

Where it lives: a glass toolbox button in the Home header (next to the sparks chip). No new tab: the tab bar stays 4 tabs + dump.
Reminders and nudges: reuse `Reminder` + `planNudges` + `rescheduleNudges`. New optional `repeat: 'daily'` on a reminder (no migration needed). Reminders the user sets still fire (they asked for them), but on a day with reminders the pet's own daily nudges shrink so the day never goes over the chosen nudge level. A time inside quiet hours shows a hint.
Routes: `src/app/tools/index.tsx` + `src/app/tools/[tool].tsx`; bodies in `src/screens/tools/*`. Pure logic in `src/features/toolkit/*` with tests (tip picker, reminder plan, unstick picker).
Checks: tsc, lint, jest, web preview light + dark, DECISIONS row, commit on main (no push).
Built: hub (`/tools`), Breathe, Calm down, Daily tip (66 tips), Unstick me, Sit with me, Reminders with "Remind me" + "Every day". Seen in the web preview: hub light, Breathe running dark, Reminders dark. Not checked yet: Android haptics and the pet-me stroke on a real phone; Screenrove check_my_ui skipped (token budget).

## Done since 10 Nov (details in DECISIONS.md)
- Lead plan (docs/15) and 20-day merged plan (docs/16): plate-first Home, 3 tabs, long-press focus mode, 5 colour themes (10 looks), pure flat backgrounds.
- The mascot is the otter (docs/18): flat in the app, water line and happy dive on Home, spark pebble.
- Money code with test ids: Android optional rewarded video, iOS Plus via RevenueCat (hidden until purchases are live).
- Spark shop: any locked Closet item can be bought one at a time with sparks; optional video in the Closet (Android).
- Anonymous analytics (PostHog) and crash reports (Sentry), one switch off, closed event list (docs/19).
- GitHub Actions diet: light Checks on every push, builds on demand (docs/20).
- Docs 02 and 11 rewritten to match the app; default pet name is now Pip.

## Next
- Sounds from the owner (new sound files go in `assets/sounds/`; candidates are in `assets/sounds/candidates/`).
- Support email address in the app and listing.
- Make the repo private (first move the legal pages and add the secrets, docs/20).
- Maestro flow for the core loop (needs Java).
- Real-phone pass: gestures, long-press menu, the dive, haptics, widgets, notifications.
- Video kit: otter model sheet in `assets/brand/`, clay videos.
- Wire `onboarding_step` analytics (one line in onboarding `go()`), docs/19.

## Blocked / needs Anass
- Sound files and the support email address.
- GitHub secrets: `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (docs/19).
- PostHog "Discard client IP data" and Sentry "Prevent storing of IP addresses" settings (docs/19).
- A new test APK on his phone (docs/20) to check analytics, ads and the otter on a real device.
- Store accounts: he pays around 1 December, not before (CLAUDE.md).
