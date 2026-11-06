---
paths:
  - "src/**/*.tsx"
  - "src/theme/motion.ts"
---
# Animation rules
- Numbers come from `src/theme/motion.ts` (transitions.dev + Screenrove exact specs, research/motion-specs.md). No ad-hoc durations or curves.
- UI motion < 300 ms; exits ~70 % of enters; never bounce a close; never scale from 0 (≥ 0.9, burst icons 0.55).
- Run on the UI thread: Reanimated shared values with `.get()`/`.set()` (React Compiler), no setState per frame, animate transform/opacity only.
- Always honour `useTheme().reduceMotion`: swap movement for a 150 ms fade or an instant change; keep haptics.
- Haptics through `src/lib/haptics.ts` (respects the setting). Stagger ≤ 40 ms, max 8 items.
