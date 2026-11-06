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

## Next
- Phase 2: the pet (Skia, from R1 art).

## Blocked / needs Anass
- App name: **Gobblo** chosen. Anass to check USPTO/EUIPO/WIPO by hand and register gobblo.app (+ getgobblo.com) and @gobblo handles.
- Flow art: R1 expression sheet; D1–D4 + E4 at 9:16, 2K, layered.
