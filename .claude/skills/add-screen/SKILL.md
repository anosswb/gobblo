---
name: add-screen
description: Add a new Gobblo screen the house way (route in src/app, body in src/screens, tokens, i18n, all states, light + dark). Use when asked to add or scaffold a screen.
---
# /add-screen <name>
1. Read docs/01 for the screen, docs/02 + docs/03, `.claude/rules/screens.md` and `.claude/rules/animation.md`.
2. Research: Screenrove `search_screens` for the pattern, `get_screen_image` on 1–3 picks, then `build_recipe` with 2–6 ids. Note the ids + capture dates in the screen's PR/commit message.
3. Create the route file in `src/app/` (routes only) that renders `src/screens/<name>/index.tsx`.
4. Strings in `src/i18n/en.ts`. Colours from `useTheme()`. Motion from `src/theme/motion.ts`.
5. Build every state: loading, empty, error, success, first-time, returning. Reduce Motion fallback.
6. Run `npx tsc --noEmit`, `npx expo lint`, `npx jest`. Screenshot light + dark (web preview or EAS simulator), run Screenrove `check_my_ui`, write a 10-line self-critique, fix, commit.
