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
- Focus: wall-clock ring timer (survives reload/kill), ends-at, pause, +5, 2-min "keep going", 2-min warning, drift, leave confirm, keep awake, end notification, brown noise / rain / soft keys.
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
- Needs a phone: swipe gestures, Liquid Glass (iOS 26), SF Symbols, haptics feel, notification prompt.

## Next
- Dev build on Anass's phone (he is logged in to EAS).
- Phase 2: the pet (Skia, from R1 art).

## Blocked / needs Anass
- App name: **Gobblo** chosen. Anass to check USPTO/EUIPO/WIPO by hand and register gobblo.app (+ getgobblo.com) and @gobblo handles.
- Flow art: R1 expression sheet; D1–D4 + E4 at 9:16, 2K, layered.
