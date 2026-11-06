---
paths:
  - "src/app/**/*.tsx"
  - "src/screens/**/*.tsx"
  - "src/components/**/*.tsx"
---
# Screen rules
- Colours only from `useTheme().colors` (src/theme/tokens.ts). No hex in components. Light and dark are designed separately (direction A + C).
- Text only through `<Text variant tone>` (4 sizes + timer). Copy lives in `src/i18n/en.ts`, lowercase, no guilt words. Never hard-code the app name: use `APP_NAME`.
- Every icon button has `accessibilityLabel`; tap targets ≥ 44×44 (use hitSlop); use `start`/`end`, never `left`/`right` (RTL later).
- Every screen designs: loading (skeleton after 120 ms only), empty (pet + one CTA), error, success, first-time, returning.
- One hero visual per screen; primary action in the thumb zone; 8-pt spacing from `space`.
- Before calling a screen done: screenshot light + dark, Screenrove `check_my_ui`, 10-line self-critique, fix.
