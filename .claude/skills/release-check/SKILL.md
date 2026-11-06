---
name: release-check
description: Run every Gobblo quality and store gate before a build (doctor, tsc, lint, tests, Maestro, replica-test, docs/05 checklist). Use before any EAS preview or production build.
---
# /release-check
Stop at the first failure and fix it.
1. `npx expo-doctor`, `npx tsc --noEmit`, `npx expo lint`, `npx jest`.
2. Maestro E2E for the core loop (onboarding → dump → drag-to-feed → 2-min focus → feed), once Maestro flows exist in `.maestro/`.
3. `/replica-test` on all flows; fix every S1/S2.
4. A subagent checks `.claude/rules/store.md` + docs/05 pre-submit checklist against the code and config; report each item ✅/❌.
5. Grep for leftovers: old name "nibbl", competitor names, "Android" in iOS strings, hex colours in components, `console.log`.
6. Report in max 6 lines.
