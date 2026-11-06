---
name: polish-screen
description: Polish an existing Gobblo screen's motion, sound and states against the transitions.dev tokens and Screenrove specs. Use when asked to polish, refine or juice a screen.
---
# /polish-screen <screen>
1. Screenshot the screen in light + dark.
2. Screenrove `suggest_polish` with the screen's parts as ONE comma-separated string and `sound: true`; `get_motion` for each entry you use.
3. Run the transitions-polish skill (`transitions review`) on the screen's files; map fixes to `src/theme/motion.ts` tokens.
4. Check: under 300 ms UI motion, no bouncing closes, stagger ≤ 40 ms, Reduce Motion fallback, haptics via `src/lib/haptics.ts`, sound respects the toggle.
5. Screenrove `check_my_ui` + 10-line "what would a top-app designer change?" critique. Fix, re-screenshot, commit.
