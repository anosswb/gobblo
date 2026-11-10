# 04 — Architecture

## Stack
- **Expo SDK 58** (React Native 0.88, iOS 27 SDK), New Architecture, TypeScript strict.
- **expo-router** (file-based). Native tabs are stable in SDK 58: use them for the tab bar if the raised FAB can be done cleanly, else a custom tab bar.
- **Builds: EAS Build in the cloud** for both platforms. Anass's computer is an Intel Mac, so don't depend on a local Xcode for releases. Use **development builds** (`expo-dev-client`), not Expo Go, because in-app purchases and some native modules don't run in Expo Go.
- Install every package with `npx expo install` (SDK-matched versions). Run `npx expo-doctor` after adding libraries.

## Libraries
| need | package |
|---|---|
| navigation | expo-router |
| animation | react-native-reanimated, react-native-worklets |
| gestures | react-native-gesture-handler |
| drawing, confetti | react-native-svg, @shopify/react-native-skia |
| bottom sheets | @gorhom/bottom-sheet |
| state | zustand (+ persist middleware wired to MMKV) |
| storage | react-native-mmkv |
| haptics | expo-haptics |
| sound | expo-audio |
| notifications | expo-notifications (local only) |
| keep awake | expo-keep-awake |
| fonts | expo-font + @expo-google-fonts/bricolage-grotesque + @expo-google-fonts/figtree |
| icons | phosphor-react-native |
| gradients, blur | expo-linear-gradient, expo-blur |
| share card | react-native-view-shot + expo-sharing |
| backup file | expo-file-system + expo-document-picker |
| rating | expo-store-review |
| purchases (iOS only) | react-native-purchases (RevenueCat) + react-native-purchases-ui (paywall) |
| ads (Android only) | react-native-google-mobile-ads (AdMob). App IDs go in app config under the `react-native-google-mobile-ads` key (`android_app_id`, `ios_app_id`); a missing App ID crashes the app at start. Consent: `AdsConsent.requestInfoUpdate()` then `AdsConsent.loadAndShowConsentFormIfRequired()`, and only request ads when `canRequestAds` is true. Then `mobileAds().initialize()`. Check the current docs, since key names have changed between versions. |
| splash, icons | expo-splash-screen, app config |
| crash reports | EAS Observe (records JS errors and native crashes; check its privacy disclosure) or Sentry. Pick one, declare it in the privacy labels. |
| tests | jest-expo + @testing-library/react-native; Maestro for E2E flows |

## Folders
```
app/                      # expo-router routes
  _layout.tsx             # fonts, theme provider, gesture root, splash
  onboarding/             # hook, quiz, egg, notify, hatch
  (tabs)/_layout.tsx      # tab bar with the raised dump FAB
  (tabs)/index.tsx        # home
  (tabs)/spin.tsx
  (tabs)/closet.tsx
  (tabs)/me.tsx
  dump.tsx                # modal route
  focus.tsx               # full-screen modal
  evolve.tsx              # transparent modal
  paywall.tsx             # iOS only
  settings/...            # about, backup, theme
src/
  config/app.ts           # APP_NAME, links (privacy, terms, support email)
  config/monetization.ts  # MONETIZATION: ios 'iap', android 'ads'
  theme/                  # tokens.ts, motion.ts, ThemeProvider, useTheme()
  ui/                     # components (see 02)
  pet/                    # Pet.tsx (SVG), parts, useIdle, useEyeTracking, accessories
  features/bites/         # store slice, parser (brain dump), chop templates, sizes
  features/focus/         # timer engine (wall-clock based), brown noise
  features/progress/      # sparks, stages, stats, brain type
  features/nudges/        # notification scheduler (caps, quiet hours)
  features/purchases/     # RevenueCat wrapper (iOS), entitlements, restore
  features/ads/           # AdMob (Android): consent, rewarded ad hook, daily caps, test IDs in dev
  lib/storage.ts          # MMKV instance + schema version + migrations
  lib/sound.ts, lib/haptics.ts   # respect settings
  i18n/                   # en first; strings in one place (fr/es/ar later)
assets/ fonts sounds images
scripts/                  # brown-noise generator, icon export
```

## Key implementation notes
- **Timer**: store `startedAt` and `endsAt` (wall clock) and compute the remaining time from `Date.now()`. Never count ticks, or the timer drifts and breaks when the app is backgrounded. Pause stores `remaining`. Schedule a local "time's up" notification at `endsAt`, and cancel it on finish/leave.
- **Parser** (brain dump): pure function with unit tests (copy the cases from the prototype: commas, "and then", "also", prefixes like "ok so i need to").
- **Dates**: "today" uses the local day. Comeback logic runs on app foreground (`AppState`), not only on cold start.
- **Storage**: one MMKV store, a `schemaVersion` key, and migrations run at boot. Never lose data on update (a top complaint about competitors).
- **Theming**: `useColorScheme()` + a user override. Set `userInterfaceStyle: "automatic"` in app config. The status bar style follows the theme.
- **Android**: edge-to-edge (default in recent SDKs), handle insets with react-native-safe-area-context, hardware back closes sheets/modals first, predictive back gesture OK.
- **i18n-ready**: all strings in `src/i18n/en.ts`. Arabic later means RTL, so use `start/end` styles instead of `left/right` from day one.
- **No analytics SDK in v1.** The AdMob SDK on Android already counts as data collection (device/advertising ID, diagnostics), so declare it. iOS has no ads, so no ATT prompt is needed.

## Environments
- `eas.json` profiles: `development` (dev client, internal), `preview` (internal testers: TestFlight / Play internal), `production` (store, auto-increment build numbers).
- Secrets (RevenueCat iOS key) go in EAS environment variables, not the repo.
- Bundle ID / package: `com.<yourbrand>.gobblo` (decide before the first store upload; it can't be changed later).
